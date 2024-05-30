import { ApiProperty } from '@nestjs/swagger';
import { FullTimeJob } from '@/job/entity/full-time-job.entity';

export class FullTimeJobDetailResponse {
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

  @ApiProperty({ type: 'date', required: true, description: '작성 일', example: new Date() })
  createdAt: Date;

  constructor(job: FullTimeJob) {
    this.title = job.title;
    this.contents = job.contents;
    this.companyName = job.companyName;
    this.province = job.province;
    this.imageUrl = job.imageUrl;
    this.majors = job.fullTimeJobMajorCategories.map(fullTimeJobMajorCategory => fullTimeJobMajorCategory.majorCategory.koName);
    this.createdAt = job.createdAt;
  }
}
