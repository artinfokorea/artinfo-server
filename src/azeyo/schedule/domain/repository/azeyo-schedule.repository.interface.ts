import { AzeyoSchedule } from '@/azeyo/schedule/domain/entity/azeyo-schedule.entity';

export const AZEYO_SCHEDULE_REPOSITORY = Symbol('AZEYO_SCHEDULE_REPOSITORY');

export interface IAzeyoScheduleRepository {
  create(schedule: Partial<AzeyoSchedule>): Promise<AzeyoSchedule>;
  findOneByIdAndUserIdOrThrow(id: number, userId: number): Promise<AzeyoSchedule>;
  findManyByUserId(userId: number): Promise<AzeyoSchedule[]>;
  softRemove(schedule: AzeyoSchedule): Promise<void>;
}
