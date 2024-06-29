import { ApiProperty } from '@nestjs/swagger';
import { ART_CATEGORY } from '@/job/entity/major-category.entity';

export class MajorGroupsRequest {
  @ApiProperty({ enum: ART_CATEGORY, enumName: 'ART_CATEGORY', required: false, description: '전공 목록' })
  firstCategory: ART_CATEGORY | null;
}
