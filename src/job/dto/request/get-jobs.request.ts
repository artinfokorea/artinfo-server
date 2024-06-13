import { List, Paging } from '@/common/type/type';
import { ApiProperty } from '@nestjs/swagger';
import { JOB_TYPE } from '@/job/entity/job.entity';
import { GetFullTimeJobsCommand } from '@/job/dto/command/get-full-time-jobs.command';
import { CountFullTimeJobsCommand } from '@/job/dto/command/count-full-time-jobs.command';
import { ToArray, ToNumberArray } from '@/common/decorator/transformer';
// import { EnumArray } from '@/common/decorator/validator';
import { EnumNullableArray } from '@/common/decorator/validator';

export class GetJobsRequest extends List {
  @ApiProperty({ type: String, required: false, description: '검색 키워드', example: '합창' })
  keyword: string | null = null;

  @ToNumberArray()
  @ApiProperty({ type: [Number], required: false, description: '카테고리 아이디 목록', example: [1, 2] })
  categoryIds: number[] = [];

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
    return new GetFullTimeJobsCommand({
      keyword: this.keyword,
      categoryIds: this.categoryIds,
      types: this.types,
      paging: paging,
      provinceIds: this.provinceIds,
    });
  }

  toCountCommand() {
    return new CountFullTimeJobsCommand({
      keyword: this.keyword,
      categoryIds: this.categoryIds,
      types: this.types,
      provinceIds: this.provinceIds,
    });
  }
}
