import { ApiProperty } from '@nestjs/swagger';
import { AzeyoScheduleRecommendation, RecommendationItem } from '@/azeyo/schedule/domain/entity/azeyo-schedule-recommendation.entity';

export class AzeyoScheduleRecommendationResponse {
  @ApiProperty() id: number;
  @ApiProperty() tagId: number;
  @ApiProperty() title: string;
  @ApiProperty() items: RecommendationItem[];

  constructor(rec: AzeyoScheduleRecommendation) {
    this.id = rec.id;
    this.tagId = rec.tagId;
    this.title = rec.title;
    this.items = rec.items;
  }
}

export class AzeyoScheduleRecommendationsResponse {
  @ApiProperty({ type: [AzeyoScheduleRecommendationResponse] }) recommendations: AzeyoScheduleRecommendationResponse[];

  constructor(items: AzeyoScheduleRecommendation[]) {
    this.recommendations = items.map(r => new AzeyoScheduleRecommendationResponse(r));
  }
}
