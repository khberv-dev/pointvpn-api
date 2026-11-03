import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoicesModule } from '../invoices/invoices.module.js';
import { PlansModule } from '../plans/plans.module.js';
import { SessionsModule } from '../sessions/sessions.module.js';
import { Subscription } from './entities/subscription.entity.js';
import { SubscriptionsController } from './subscriptions.controller.js';
import { SubscriptionsService } from './subscriptions.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subscription]),
    SessionsModule,
    PlansModule,
    InvoicesModule,
  ],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
