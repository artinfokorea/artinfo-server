import { ApiProperty } from '@nestjs/swagger';
import { EnumNullableArray } from '@/common/decorator/validator';
import { ToArray } from '@/common/decorator/transformer';
import { ART_CATEGORY } from '@/job/entity/major-category.entity';

export class MajorFieldsRequest {
  @EnumNullableArray(ART_CATEGORY)
  @ToArray()
  @ApiProperty({
    type: [ART_CATEGORY],
    enum: ART_CATEGORY,
    enumName: 'ART_CATEGORY',
    required: false,
    description: '전문 분야',
    example: [ART_CATEGORY.MUSIC],
  })
  artCategories: ART_CATEGORY[] = [];
}
