import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AzeyoSchedulerHistory, AZEYO_SCHEDULER_STATUS } from '@/azeyo/scheduler/domain/entity/azeyo-scheduler-history.entity';
import { IAzeyoSchedulerHistoryRepository } from '@/azeyo/scheduler/domain/repository/azeyo-scheduler-history.repository.interface';

@Injectable()
export class AzeyoSchedulerHistoryRepository implements IAzeyoSchedulerHistoryRepository {
  constructor(
    @InjectRepository(AzeyoSchedulerHistory)
    private readonly repository: Repository<AzeyoSchedulerHistory>,
  ) {}

  async record(params: {
    schedulerName: string;
    status: AZEYO_SCHEDULER_STATUS;
    result: string | null;
    errorMessage: string | null;
    durationMs: number;
  }): Promise<AzeyoSchedulerHistory> {
    const entity = this.repository.create(params);
    return this.repository.save(entity);
  }
}
