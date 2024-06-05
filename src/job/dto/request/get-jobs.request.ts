import { List, Paging } from '@/common/type/type';
import { ApiProperty } from '@nestjs/swagger';
import { JOB_TYPE } from '@/job/entity/job.entity';
import { GetFullTimeJobsCommand } from '@/job/dto/command/get-full-time-jobs.command';
import { CountFullTimeJobsCommand } from '@/job/dto/command/count-full-time-jobs.command';
import { ToArray } from '@/common/decorator/transformer';
import { ArrayType, EnumArray } from "@/common/decorator/validator";

export class GetJobsRequest extends List {
  @ApiProperty({ type: String, required: false, description: '검색 키워드', example: '합창' })
  keyword: string | null = null;

  @ArrayType()
  @ToArray()
  @ApiProperty({ type: [Number], required: false, description: '카테고리 아이디 목록', example: [1, 2] })
  categoryIds: number[] = [];

  @EnumArray(JOB_TYPE)
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

  toGetCommand() {
    const paging: Paging = { page: this.page, size: this.size };
    return new GetFullTimeJobsCommand({ keyword: this.keyword, categoryIds: this.categoryIds, types: this.types, paging: paging });
  }

  toCountCommand() {
    return new CountFullTimeJobsCommand({ keyword: this.keyword, categoryIds: this.categoryIds, types: this.types });
  }
}
