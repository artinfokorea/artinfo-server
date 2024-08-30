import { ApiProperty } from '@nestjs/swagger';
import { EnumNullableArray } from '@/common/decorator/validator';
import { ToArray, ToNumberArray } from '@/common/decorator/transformer';
import { PERFORMANCE_CATEGORY } from '@/performance/performance.entity';
import { GetPerformancesQuery } from '@/performance/dto/query/get-performances.query';
import { List, Paging } from '@/common/type/type';

export class GetPerformancesRequest extends List {
  @ApiProperty({ type: String, required: false, description: '검색 키워드', example: '합창' })
  keyword: string | null = null;

  @EnumNullableArray(PERFORMANCE_CATEGORY)
  @ToArray()
  @ApiProperty({
    type: [PERFORMANCE_CATEGORY],
    enum: PERFORMANCE_CATEGORY,
    enumName: 'PERFORMANCE_CATEGORY',
    required: false,
    description: '공연 카테고리',
    example: [PERFORMANCE_CATEGORY.CLASSIC],
  })
  categories: PERFORMANCE_CATEGORY[] = [];

  @ToNumberArray()
  @ApiProperty({
    type: [Number],
    required: false,
    description: '행정 구역 아이디 목록',
    example: [1, 2],
  })
  provinceIds: number[] = [];

  toQuery() {
    const paging: Paging = { page: this.page, size: this.size };

    return new GetPerformancesQuery({
      keyword: this.keyword,
      categories: this.categories,
      provinceIds: this.provinceIds,
      paging: paging,
    });
  }
}
