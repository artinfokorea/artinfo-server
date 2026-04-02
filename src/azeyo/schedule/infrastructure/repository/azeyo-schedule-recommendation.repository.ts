import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { AzeyoScheduleRecommendation } from '@/azeyo/schedule/domain/entity/azeyo-schedule-recommendation.entity';
import { IAzeyoScheduleRecommendationRepository } from '@/azeyo/schedule/domain/repository/azeyo-schedule-recommendation.repository.interface';

@Injectable()
export class AzeyoScheduleRecommendationRepository implements IAzeyoScheduleRecommendationRepository {
  constructor(
    @InjectRepository(AzeyoScheduleRecommendation)
    private readonly repository: Repository<AzeyoScheduleRecommendation>,
  ) {}

  async findByTagIds(tagIds: number[]): Promise<AzeyoScheduleRecommendation[]> {
    if (tagIds.length === 0) return [];
    return this.repository.find({ where: { tagId: In(tagIds) } });
  }
}
