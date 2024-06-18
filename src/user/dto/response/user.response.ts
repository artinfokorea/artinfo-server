import { ApiProperty } from '@nestjs/swagger';
import { User } from '@/user/entity/user.entity';
import { UserSchoolResponse } from '@/user/dto/response/user-school.response';
import { MajorResponse } from '@/major/dto/response/majors.response';

export class UserResponse {
  @ApiProperty({ type: 'number', required: true, description: '유저 아이디', example: 5 })
  id: number;

  @ApiProperty({ type: 'string', required: true, description: '유저 이름', example: '임성준' })
  name: string;

  @ApiProperty({ type: 'string', required: true, description: '유저 닉네임', example: '임성준준' })
  nickname: string;

  @ApiProperty({ type: 'string', required: true, description: '유저 이메일', example: 'artinfokorea@gmail.com' })
  email: string;

  @ApiProperty({ type: 'string | null', required: false, description: '유저 아이콘 이미지 주소', example: 'https://artinfokorea@gmail.com' })
  iconImageUrl: string | null;

  @ApiProperty({ type: [MajorResponse], required: true, description: '유저 전공 목록' })
  majors: MajorResponse[];

  @ApiProperty({ type: [UserSchoolResponse], required: true, description: '유저 학교 목록' })
  schools: UserSchoolResponse[];

  constructor(user: User) {
    this.id = user.id;
    this.name = user.name;
    this.nickname = user.nickname;
    this.email = user.email;
    this.iconImageUrl = user.iconImageUrl;
    this.majors = user.userMajorCategories.map(userMajorCategory => new MajorResponse(userMajorCategory.majorCategory));
    this.schools = user.schools.map(school => new UserSchoolResponse(school));
  }
}
