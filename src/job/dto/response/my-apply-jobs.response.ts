import { ApiProperty } from '@nestjs/swagger';
import { MyApplyJobResponse } from '@/job/dto/response/my-apply-job.response';
import { JobUser } from '@/job/entity/job-user.entity';

export class MyApplyJobsResponse {
  @ApiProperty({ type: [MyApplyJobResponse], required: true, description: '채용 목록' })
  jobs: MyApplyJobResponse[];

  @ApiProperty({ type: 'number', required: true, description: '총 개수', example: 5 })
  totalCount: number;

  constructor({ jobUsers, totalCount }: { jobUsers: JobUser[]; totalCount: number }) {
    this.jobs = jobUsers.map(jobUser => new MyApplyJobResponse(jobUser));
    this.totalCount = totalCount;
  }
}
