import { ApiProperty } from '@nestjs/swagger';
import { UserSchoolResponse } from '@/user/dto/response/user-school.response';
import { MajorResponse } from '@/major/dto/response/major.response';
import { JobUser } from '@/job/entity/job-user.entity';

export class JobApplicantResponse {
  @ApiProperty({ type: 'number', required: true, description: '유저 아이디', example: 5 })
  id: number;

  @ApiProperty({ type: 'string', required: true, description: '유저 이름', example: '임성준' })
  name: string;

  @ApiProperty({ type: 'string', required: true, description: '유저 소개', example: '안녕하세요' })
  profile: string;

  @ApiProperty({ type: 'string | null', required: false, description: '유저 연락처', example: '010-4028-7451' })
  phone: string | null;

  @ApiProperty({ type: 'string | null', required: false, description: '유저 아이콘 이미지 주소', example: 'https://artinfokorea@gmail.com' })
  iconImageUrl: string | null;

  @ApiProperty({ type: [MajorResponse], required: true, description: '유저 전공 목록' })
  majors: MajorResponse[];

  @ApiProperty({ type: [UserSchoolResponse], required: true, description: '유저 학교 목록' })
  schools: UserSchoolResponse[];

  constructor(jobUser: JobUser) {
    this.id = jobUser.user.id;
    this.profile = jobUser.profile;
    this.name = jobUser.user.name;
    this.phone = jobUser.user.phone;
    this.iconImageUrl = jobUser.user.iconImageUrl;
    this.majors = jobUser.user.userMajorCategories.map(userMajorCategory => new MajorResponse(userMajorCategory.majorCategory));
    this.schools = jobUser.user.schools.map(school => new UserSchoolResponse(school));
  }
}
