import { ApiProperty } from '@nestjs/swagger';
import { Job, JOB_TYPE } from '@/job/entity/job.entity';
import { MajorsResponse } from '@/major/dto/response/majors.response';

export class JobSchedule {
  @ApiProperty({ type: 'date', required: true, description: '시작 일', example: new Date() })
  startAt: Date;

  @ApiProperty({ type: 'date', required: true, description: '종료 일', example: new Date() })
  endAt: Date;
}

export class JobResponse {
  @ApiProperty({ type: 'number', required: true, description: '채용 아이디', example: 2 })
  id: number;

  @ApiProperty({ type: 'number', required: true, description: '작성자 아이디', example: 2 })
  authorId: number;

  @ApiProperty({ type: 'string', required: true, description: '채용 제목', example: '춘천시립예술단 단원 모집' })
  title: string;

  @ApiProperty({ type: 'string', required: true, description: '채용 내용', example: '춘천시립예술단 단원 모집합니다' })
  contents: string;

  @ApiProperty({ type: 'string', required: true, description: '단체명', example: '춘천시립예술단' })
  companyName: string;

  @ApiProperty({ type: 'string', required: false, description: '주소', example: '강원도 정선군 정선읍 북실리 마루아파트 102동 903호' })
  address: string | null;

  @ApiProperty({ type: 'string', required: false, description: '상세 주소', example: '401호' })
  addressDetail: string | null;

  @ApiProperty({ type: 'string', required: false, description: '자사 채용 사이트 주소', example: 'https://artinfokorea.com' })
  recruitSiteUrl: string | null;

  @ApiProperty({ type: 'string', required: false, description: '회사 대표 이미지', example: 'https://artinfokorea.com' })
  imageUrl: string | null;

  @ApiProperty({ required: true, description: '전공 목록', example: ['PIANO', 'ORGAN'] })
  majors: MajorsResponse;

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

  @ApiProperty({ type: [JobSchedule], required: false, description: '단기직 일정' })
  schedules: JobSchedule[];

  @ApiProperty({ type: 'date', required: true, description: '작성 일', example: new Date() })
  createdAt: Date;

  constructor(job: Job) {
    this.id = job.id;
    this.authorId = job.user.id;
    this.title = job.title;
    this.contents = job.contents;
    this.companyName = job.companyName;
    this.address = job.address;
    this.addressDetail = job.addressDetail;
    this.recruitSiteUrl = job.recruitSiteUrl;
    this.imageUrl = job.imageUrl;
    this.majors = new MajorsResponse([...job.jobMajorCategories.map(jobMajorCategory => jobMajorCategory.majorCategory)]);
    this.type = job.type;
    this.isActive = job.isActive;
    this.fee = job.fee;
    this.startAt = job.startAt;
    this.endAt = job.endAt;
    this.schedules = job.schedules ?? null;
    this.createdAt = job.createdAt;
  }
}
