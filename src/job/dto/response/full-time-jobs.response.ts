import { ApiProperty } from '@nestjs/swagger';
import { FullTimeJob } from '@/job/entity/full-time-job.entity';
import { FullTimeJobResponse } from '@/job/dto/response/full-time-job.response';

export class FullTimeJobsResponse {
  @ApiProperty({ type: [FullTimeJobResponse], required: true, description: '채용 목록' })
  jobs: FullTimeJobResponse[];

  @ApiProperty({ type: 'number', required: true, description: '총 개수', example: 5 })
  totalCount: number;

  constructor({ jobs, totalCount }: { jobs: FullTimeJob[]; totalCount: number }) {
    this.jobs = jobs.map(job => new FullTimeJobResponse(job));
    this.totalCount = totalCount;
  }
}
