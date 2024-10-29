import { ApiProperty } from '@nestjs/swagger';
import { JobUser } from '@/job/entity/job-user.entity';

export class MyApplyJobResponse {
  @ApiProperty({ type: 'number', required: true, description: '채용 아이디', example: 5 })
  id: number;

  @ApiProperty({ type: 'string', required: true, description: '채용 제목', example: '춘천시립예술단 단원 모집' })
  title: string;

  @ApiProperty({ type: 'boolean', required: true, description: '채용 활성화 여부', example: true })
  isActive: boolean;

  @ApiProperty({ type: 'date', required: true, description: '작성 일', example: new Date() })
  appliedAt: Date;

  constructor(jobUser: JobUser) {
    this.id = jobUser.job.id;
    this.title = jobUser.job.title;
    this.isActive = jobUser.job.isActive;
    this.appliedAt = jobUser.createdAt;
  }
}
