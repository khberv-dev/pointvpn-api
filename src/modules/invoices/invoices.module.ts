import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RhmtModule } from '../rhmt/rhmt.module.js';
import { Invoice } from './entities/invoice.entity.js';
import { InvoicesService } from './invoices.service.js';
import { PaymentController } from './payment.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice]), RhmtModule],
  controllers: [PaymentController],
  providers: [InvoicesService],
  exports: [InvoicesService],
})
export class InvoicesModule {}
