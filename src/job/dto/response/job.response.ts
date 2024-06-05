import { ApiProperty } from '@nestjs/swagger';
import { JOB_TYPE, Job } from '@/job/entity/job.entity';

export class JobResponse {
  @ApiProperty({ type: 'number', required: true, description: '채용 아이디', example: 2 })
  id: number;

  @ApiProperty({ type: 'string', required: true, description: '채용 제목', example: '춘천시립예술단 단원 모집' })
  title: string;

  @ApiProperty({ type: 'string', required: true, description: '채용 내용', example: '춘천시립예술단 단원 모집합니다' })
  contents: string;

  @ApiProperty({ type: 'string', required: true, description: '단체명', example: '춘천시립예술단' })
  companyName: string;

  @ApiProperty({ type: 'string', required: false, description: '회사 지역', example: '서울' })
  province: string | null;

  @ApiProperty({ type: 'string', required: false, description: '회사 대표 이미지', example: 'https://artinfokorea.com' })
  imageUrl: string | null;

  @ApiProperty({ type: 'string[]', required: true, description: '전공 목록', example: ['PIANO', 'ORGAN'] })
  majors: string[];

  @ApiProperty({ enum: JOB_TYPE, enumName: 'JOB_TYPE', required: true, description: '채용 타입', example: JOB_TYPE.RELIGION })
  type: JOB_TYPE;

  @ApiProperty({ type: 'boolean', required: true, description: '채용 활성화 여부', example: true })
  isActive: boolean;

  @ApiProperty({ type: 'number', required: false, description: '사례비', example: 50000 })
  fee: number | null;

  @ApiProperty({ type: 'date', required: false, description: '시작 일', example: new Date() })
  startAt: Date | null;

  @ApiProperty({ type: 'date', required: false, description: '종료 일', example: new Date() })
  endAt: Date | null;

  @ApiProperty({ type: 'date', required: true, description: '작성 일', example: new Date() })
  createdAt: Date;

  constructor(job: Job) {
    this.id = job.id;
    this.title = job.title;
    this.contents = job.contents;
    this.companyName = job.companyName;
    this.province = job.province;
    this.imageUrl = job.imageUrl;
    this.majors = job.jobMajorCategories.map(jobMajorCategory => jobMajorCategory.majorCategory.koName);
    this.type = job.type;
    this.isActive = job.isActive;
    this.fee = job.fee;
    this.startAt = job.startAt;
    this.endAt = job.endAt;
    this.createdAt = job.createdAt;
  }
}
