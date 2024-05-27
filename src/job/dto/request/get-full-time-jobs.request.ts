import { List, Paging } from '@/common/type/type';
import { ApiProperty } from '@nestjs/swagger';
import { FULL_TIME_JOB_TYPE } from '@/job/entity/full-time-job.entity';
import { GetFullTimeJobsCommand } from '@/job/dto/command/get-full-time-jobs.command';
import { CountFullTimeJobsCommand } from '@/job/dto/command/count-full-time-jobs.command';
import { Enum, NotBlank } from '@/common/decorator/validator';

export class GetFullTimeJobsRequest extends List {
  @ApiProperty({ type: [Number], required: false, description: '카테고리 아이디 목록', example: 1 })
  categoryIds: number[] = [];

  @Enum(FULL_TIME_JOB_TYPE)
  @NotBlank()
  @ApiProperty({
    enum: FULL_TIME_JOB_TYPE,
    enumName: 'FULL_TIME_JOB_TYPE',
    required: true,
    description: '채용 타입',
    example: FULL_TIME_JOB_TYPE.ART_ORGANIZATION,
  })
  type: FULL_TIME_JOB_TYPE;

  toGetCommand() {
    const paging: Paging = { page: this.page, size: this.size };
    return new GetFullTimeJobsCommand({ categoryIds: this.categoryIds, type: this.type, paging: paging });
  }

  toCountCommand() {
    return new CountFullTimeJobsCommand({ categoryIds: this.categoryIds, type: this.type });
  }
}
