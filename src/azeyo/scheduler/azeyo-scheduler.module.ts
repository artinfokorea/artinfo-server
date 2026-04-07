import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AzeyoSchedulerHistory } from '@/azeyo/scheduler/domain/entity/azeyo-scheduler-history.entity';
import { AZEYO_SCHEDULER_HISTORY_REPOSITORY } from '@/azeyo/scheduler/domain/repository/azeyo-scheduler-history.repository.interface';
import { AzeyoSchedulerHistoryRepository } from '@/azeyo/scheduler/infrastructure/repository/azeyo-scheduler-history.repository';

@Module({
  imports: [TypeOrmModule.forFeature([AzeyoSchedulerHistory])],
  providers: [
    { provide: AZEYO_SCHEDULER_HISTORY_REPOSITORY, useClass: AzeyoSchedulerHistoryRepository },
  ],
  exports: [AZEYO_SCHEDULER_HISTORY_REPOSITORY],
})
export class AzeyoSchedulerModule {}
