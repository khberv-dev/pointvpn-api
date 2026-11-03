import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { InvoicesService } from '../invoices/invoices.service.js';
import { PlansService } from '../plans/plans.service.js';
import { SessionsService } from '../sessions/sessions.service.js';
import { Subscription } from './entities/subscription.entity.js';

export interface SubscriptionRequestResult {
  subscriptionId: string;
  invoiceId: string;
  /** In tiyin. */
  amount: number;
  /** Multicard payment page; open it in the app to pay. */
  checkoutUrl: string;
}

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionsRepository: Repository<Subscription>,
    private readonly sessionsService: SessionsService,
    private readonly plansService: PlansService,
    private readonly invoicesService: InvoicesService,
  ) {}

  /**
   * Active subscriptions (paid and `endDate` in the future), newest first,
   * each with its plan. Throws 404 if the session doesn't exist.
   */
  async findActiveBySession(sessionId: string): Promise<Subscription[]> {
    await this.sessionsService.findById(sessionId);
    return this.subscriptionsRepository.find({
      where: { sessionId, isActive: true, endDate: MoreThan(new Date()) },
      relations: { plan: true },
      order: { startDate: 'DESC' },
    });
  }

  /**
   * Creates an inactive subscription and a Multicard invoice for it. The
   * subscription is activated by the payment callback.
   */
  async request(
    sessionId: string,
    planId: string,
  ): Promise<SubscriptionRequestResult> {
    await this.sessionsService.findById(sessionId);
    const plan = await this.plansService.findById(planId);

    const subscription = await this.subscriptionsRepository.save(
      this.subscriptionsRepository.create({ sessionId, planId }),
    );
    const invoice = await this.invoicesService.createForSubscription(
      subscription,
      plan,
    );

    return {
      subscriptionId: subscription.id,
      invoiceId: invoice.id,
      amount: invoice.amount,
      checkoutUrl: invoice.checkoutUrl!,
    };
  }
}
