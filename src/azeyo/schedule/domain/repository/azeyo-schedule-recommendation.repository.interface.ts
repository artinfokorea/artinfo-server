import { AzeyoScheduleRecommendation } from '@/azeyo/schedule/domain/entity/azeyo-schedule-recommendation.entity';

export const AZEYO_SCHEDULE_RECOMMENDATION_REPOSITORY = Symbol('AZEYO_SCHEDULE_RECOMMENDATION_REPOSITORY');

export interface IAzeyoScheduleRecommendationRepository {
  findByTagIds(tagIds: number[]): Promise<AzeyoScheduleRecommendation[]>;
}
