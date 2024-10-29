import { ApiProperty } from '@nestjs/swagger';
import { JobApplicantResponse } from '@/job/dto/response/job-applicant.response';
import { JobUser } from '@/job/entity/job-user.entity';

export class JobApplicantsResponse {
  @ApiProperty({ type: [JobApplicantResponse], required: true, description: '유저 목록' })
  applicants: JobApplicantResponse[];

  constructor(jobUsers: JobUser[]) {
    this.applicants = jobUsers.map(jobUser => new JobApplicantResponse(jobUser));
  }
}
