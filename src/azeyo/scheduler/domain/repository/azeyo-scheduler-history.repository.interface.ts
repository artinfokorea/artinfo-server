import { AzeyoSchedulerHistory, AZEYO_SCHEDULER_STATUS } from '@/azeyo/scheduler/domain/entity/azeyo-scheduler-history.entity';

export const AZEYO_SCHEDULER_HISTORY_REPOSITORY = Symbol('AZEYO_SCHEDULER_HISTORY_REPOSITORY');

export interface IAzeyoSchedulerHistoryRepository {
  record(params: {
    schedulerName: string;
    status: AZEYO_SCHEDULER_STATUS;
    result: string | null;
    errorMessage: string | null;
    durationMs: number;
  }): Promise<AzeyoSchedulerHistory>;
}
