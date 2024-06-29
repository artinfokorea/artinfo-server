import { List, Paging } from '@/common/type/type';
import { ApiProperty } from '@nestjs/swagger';
import { JOB_TYPE } from '@/job/entity/job.entity';
import { GetJobsCommand } from '@/job/dto/command/get-jobs.command';
import { CountJobsCommand } from '@/job/dto/command/count-jobs.command';
import { ToArray, ToNumberArray } from '@/common/decorator/transformer';
import { EnumNullableArray } from '@/common/decorator/validator';
import { PROFESSIONAL_FIELD_CATEGORY } from '@/job/entity/major-category.entity';

export class GetJobsRequest extends List {
  @ApiProperty({ type: String, required: false, description: '검색 키워드', example: '합창' })
  keyword: string | null = null;

  @EnumNullableArray(JOB_TYPE)
  @ToArray()
  @ApiProperty({
    type: [JOB_TYPE],
    enum: JOB_TYPE,
    enumName: 'JOB_TYPE',
    required: false,
    description: '채용 타입',
    example: [JOB_TYPE.ART_ORGANIZATION],
  })
  types: JOB_TYPE[] = [];

  @EnumNullableArray(PROFESSIONAL_FIELD_CATEGORY)
  @ToArray()
  @ApiProperty({
    type: [PROFESSIONAL_FIELD_CATEGORY],
    enum: PROFESSIONAL_FIELD_CATEGORY,
    enumName: 'PROFESSIONAL_FIELD_CATEGORY',
    required: false,
    description: '전문 분야 카테고리',
    example: [PROFESSIONAL_FIELD_CATEGORY.CLASSIC],
  })
  professionalFields: PROFESSIONAL_FIELD_CATEGORY[] = [];

  @ToNumberArray()
  @ApiProperty({
    type: [Number],
    required: false,
    description: '행정 구역 아이디 목록',
    example: [1, 2],
  })
  provinceIds: number[] = [];

  toGetCommand() {
    const paging: Paging = { page: this.page, size: this.size };
    return new GetJobsCommand({
      keyword: this.keyword,
      types: this.types,
      professionalFields: this.professionalFields,
      paging: paging,
      provinceIds: this.provinceIds,
    });
  }

  toCountCommand() {
    return new CountJobsCommand({
      keyword: this.keyword,
      types: this.types,
      professionalFields: this.professionalFields,
      provinceIds: this.provinceIds,
    });
  }
}
