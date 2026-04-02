import { Inject, Injectable } from '@nestjs/common';
import { AZEYO_SCHEDULE_RECOMMENDATION_REPOSITORY, IAzeyoScheduleRecommendationRepository } from '@/azeyo/schedule/domain/repository/azeyo-schedule-recommendation.repository.interface';
import { AzeyoScheduleRecommendation } from '@/azeyo/schedule/domain/entity/azeyo-schedule-recommendation.entity';

@Injectable()
export class AzeyoScanScheduleRecommendationsUseCase {
  constructor(
    @Inject(AZEYO_SCHEDULE_RECOMMENDATION_REPOSITORY)
    private readonly recommendationRepository: IAzeyoScheduleRecommendationRepository,
  ) {}

  async execute(tagIds: number[]): Promise<AzeyoScheduleRecommendation[]> {
    return this.recommendationRepository.findByTagIds(tagIds);
  }
}
