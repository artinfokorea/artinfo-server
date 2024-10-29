import { ApiProperty } from '@nestjs/swagger';
import { Job } from '@/job/entity/job.entity';
import { PartTimeJobResponse } from '@/job/dto/response/part-time-job.response';

export class PartTimeJobsResponse {
  @ApiProperty({ type: [PartTimeJobResponse], required: true, description: '채용 목록' })
  jobs: PartTimeJobResponse[];

  @ApiProperty({ type: 'number', required: true, description: '총 개수', example: 5 })
  totalCount: number;

  constructor({ jobs, totalCount }: { jobs: Job[]; totalCount: number }) {
    this.jobs = jobs.map(job => new PartTimeJobResponse(job));
    this.totalCount = totalCount;
  }
}
