import { List, Paging } from '@/common/type/type';
import { ApiProperty } from '@nestjs/swagger';
import { ToArray, ToNumberArray } from '@/common/decorator/transformer';
import { EnumNullableArray } from '@/common/decorator/validator';
import { MAJOR_GROUP_CATEGORY } from '@/job/entity/major-category.entity';
import { GetPartTimeJobsQuery } from '@/job/dto/query/get-part-time-jobs.query';

export class GetPartTimeJobsRequest extends List {
  @ApiProperty({ type: String, required: false, description: '검색 키워드', example: '합창' })
  keyword: string | null = null;

  @EnumNullableArray(MAJOR_GROUP_CATEGORY)
  @ToArray()
  @ApiProperty({
    type: [MAJOR_GROUP_CATEGORY],
    enum: MAJOR_GROUP_CATEGORY,
    enumName: 'MAJOR_GROUP_CATEGORY',
    required: false,
    description: '전공 그룹',
    example: [MAJOR_GROUP_CATEGORY.BRASS_WIND],
  })
  majorGroups: MAJOR_GROUP_CATEGORY[] = [];

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
    return new GetPartTimeJobsQuery({
      keyword: this.keyword,
      majorGroups: this.majorGroups,
      paging: paging,
      provinceIds: this.provinceIds,
    });
  }
}
