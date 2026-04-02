import { AzeyoScheduleTag } from '@/azeyo/schedule/domain/entity/azeyo-schedule-tag.entity';

export const AZEYO_SCHEDULE_TAG_REPOSITORY = Symbol('AZEYO_SCHEDULE_TAG_REPOSITORY');

export interface IAzeyoScheduleTagRepository {
  create(tag: Partial<AzeyoScheduleTag>): Promise<AzeyoScheduleTag>;
  findByIds(ids: number[]): Promise<AzeyoScheduleTag[]>;
  findSystemAndUserTags(userId: number): Promise<AzeyoScheduleTag[]>;
}
