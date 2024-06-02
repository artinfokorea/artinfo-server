import { ApiProperty } from '@nestjs/swagger';
import { Job } from '@/job/entity/job.entity';
import { JobResponse } from '@/job/dto/response/job.response';

export class JobsResponse {
  @ApiProperty({ type: [JobResponse], required: true, description: '채용 목록' })
  jobs: JobResponse[];

  @ApiProperty({ type: 'number', required: true, description: '총 개수', example: 5 })
  totalCount: number;

  constructor({ jobs, totalCount }: { jobs: Job[]; totalCount: number }) {
    this.jobs = jobs.map(job => new JobResponse(job));
    this.totalCount = totalCount;
  }
}
