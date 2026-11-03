import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Plan } from '../plans/entities/plan.entity.js';
import { RhmtService } from '../rhmt/rhmt.service.js';
import { Subscription } from '../subscriptions/entities/subscription.entity.js';
import { Invoice, InvoiceStatus } from './entities/invoice.entity.js';

/** Every paid subscription lasts this long, starting at payment time. */
const SUBSCRIPTION_DAYS = 30;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Body of Multicard's success callback (only the fields we use). */
export interface PaymentCallback {
  store_id?: unknown;
  invoice_id?: unknown;
  amount?: unknown;
  uuid?: unknown;
  sign?: unknown;
}

/** Reply format Multicard expects. `success: false` cancels and refunds. */
export interface PaymentCallbackResult {
  success: boolean;
  message?: string;
}

@Injectable()
export class InvoicesService {
  private readonly logger = new Logger(InvoicesService.name);
  private readonly roublePrice: number;

  constructor(
    @InjectRepository(Invoice)
    private readonly invoicesRepository: Repository<Invoice>,
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly rhmt: RhmtService,
    config: ConfigService,
  ) {
    this.roublePrice = Number(config.getOrThrow('ROUBLE_PRICE'));
    if (!(this.roublePrice > 0)) {
      throw new Error('ROUBLE_PRICE must be a positive number');
    }
  }

  /**
   * Creates our invoice row, then the Multicard invoice for it.
   * Amount in tiyin = plan price (RUB) × ROUBLE_PRICE (UZS per RUB) × 100.
   */
  async createForSubscription(
    subscription: Subscription,
    plan: Plan,
  ): Promise<Invoice> {
    const invoice = await this.invoicesRepository.save(
      this.invoicesRepository.create({
        subscriptionId: subscription.id,
        amount: Math.round(plan.price * this.roublePrice * 100),
      }),
    );

    try {
      const rhmtInvoice = await this.rhmt.createInvoice({
        amount: invoice.amount,
        invoiceId: invoice.id,
      });
      invoice.rhmtUuid = rhmtInvoice.uuid;
      invoice.checkoutUrl = rhmtInvoice.checkoutUrl;
    } catch (error) {
      invoice.status = InvoiceStatus.Failed;
      await this.invoicesRepository.save(invoice);
      throw error;
    }

    return this.invoicesRepository.save(invoice);
  }

  /**
   * Handles Multicard's success callback. Idempotent: a repeated callback for
   * an already-paid invoice with the same uuid succeeds again without changes.
   * Unexpected errors propagate as 500, which makes Multicard retry.
   */
  async handlePaymentCallback(
    payload: PaymentCallback,
  ): Promise<PaymentCallbackResult> {
    const { store_id, invoice_id, amount, uuid, sign } = payload;

    if (
      (typeof store_id !== 'number' && typeof store_id !== 'string') ||
      typeof invoice_id !== 'string' ||
      typeof amount !== 'number' ||
      typeof uuid !== 'string' ||
      typeof sign !== 'string'
    ) {
      return this.reject('Invalid payload', payload);
    }
    if (!this.rhmt.verifyCallbackSign(store_id, invoice_id, amount, sign)) {
      return this.reject('Invalid signature', payload);
    }
    if (String(store_id) !== this.rhmt.configuredStoreId) {
      return this.reject('Unknown store', payload);
    }
    if (!UUID_RE.test(invoice_id)) {
      return this.reject('Invoice not found', payload);
    }

    return this.dataSource.transaction(async (manager) => {
      // Row lock: concurrent duplicate callbacks are processed one at a time.
      const invoice = await manager.findOne(Invoice, {
        where: { id: invoice_id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!invoice) return this.reject('Invoice not found', payload);
      if (invoice.amount !== amount) {
        return this.reject('Amount mismatch', payload);
      }
      if (invoice.status === InvoiceStatus.Paid) {
        return invoice.rhmtUuid === uuid
          ? { success: true }
          : this.reject('Invoice already paid', payload);
      }

      const now = new Date();
      invoice.status = InvoiceStatus.Paid;
      invoice.rhmtUuid = uuid;
      invoice.paidAt = now;
      await manager.save(invoice);

      await manager.update(
        Subscription,
        { id: invoice.subscriptionId },
        {
          isActive: true,
          startDate: now,
          endDate: new Date(now.getTime() + SUBSCRIPTION_DAYS * 86_400_000),
        },
      );

      this.logger.log(
        `Invoice ${invoice.id} paid (${uuid}); subscription ${invoice.subscriptionId} activated`,
      );
      return { success: true };
    });
  }

  private reject(
    message: string,
    payload: PaymentCallback,
  ): PaymentCallbackResult {
    this.logger.warn(
      `Payment callback rejected: ${message} (invoice_id=${String(payload.invoice_id)}, uuid=${String(payload.uuid)})`,
    );
    return { success: false, message };
  }
}
