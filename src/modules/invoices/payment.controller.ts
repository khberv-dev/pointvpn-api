import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  InvoicesService,
  type PaymentCallback,
  type PaymentCallbackResult,
} from './invoices.service.js';

@Controller('payment')
export class PaymentController {
  constructor(private readonly invoicesService: InvoicesService) {}

  /**
   * Multicard success callback (RHMT_CALLBACK_URL should point here).
   * Always 200; `success: false` in the body tells Multicard to refund.
   * The body is an interface, so the global ValidationPipe leaves it alone
   * and the service validates it.
   */
  @Post('handle')
  @HttpCode(HttpStatus.OK)
  handle(@Body() payload: PaymentCallback): Promise<PaymentCallbackResult> {
    return this.invoicesService.handlePaymentCallback(payload);
  }
}
