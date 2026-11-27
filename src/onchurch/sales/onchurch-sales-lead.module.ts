import { Module } from '@nestjs/common';
import { OnchurchUserModule } from '@/onchurch/user/onchurch-user.module';
import { OnchurchSalesLeadController } from '@/onchurch/sales/onchurch-sales-lead.controller';
import { OnchurchSalesLeadUseCase } from '@/onchurch/sales/onchurch-sales-lead.usecase';
import { OnchurchSalesLeadRepository } from '@/onchurch/sales/onchurch-sales-lead.repository';

@Module({
  imports: [OnchurchUserModule],
  controllers: [OnchurchSalesLeadController],
  providers: [OnchurchSalesLeadUseCase, OnchurchSalesLeadRepository],
})
export class OnchurchSalesLeadModule {}
