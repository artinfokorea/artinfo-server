import { List, Paging } from '@/common/type/type';
import { ApiProperty } from '@nestjs/swagger';
import { ToArray, ToNumber, ToNumberArray } from '@/common/decorator/transformer';
import { EnumNullableArray } from '@/common/decorator/validator';
import { MAJOR } from '@/job/entity/major-category.entity';
import { AdmissionFetcher } from '@/admission/repository/operation/admission.fetcher';

export class GetAdmissionsRequest extends List {
  @ApiProperty({ type: String, required: false, description: '검색 키워드 (학교명)', example: '서울대' })
  keyword: string | null = null;

  @ToNumber()
  @ApiProperty({ type: Number, required: false, description: '입시 년도', example: 2026 })
  year: number | null = null;

  @ToNumberArray()
  @ApiProperty({ type: [Number], required: false, description: '전공 카테고리 ID 목록', example: [1, 2] })
  majorCategoryIds: number[] = [];

  @EnumNullableArray(MAJOR)
  @ToArray()
  @ApiProperty({
    type: [MAJOR],
    enum: MAJOR,
    enumName: 'MAJOR',
    required: false,
    description: '전공',
    example: [MAJOR.PIANO],
  })
  majors: MAJOR[] = [];

  toFetcher(): AdmissionFetcher {
    const paging: Paging = { page: this.page, size: this.size };
    return new AdmissionFetcher({
      keyword: this.keyword,
      year: this.year,
      majorCategoryIds: this.majorCategoryIds,
      majors: this.majors,
      paging,
    });
  }
}
