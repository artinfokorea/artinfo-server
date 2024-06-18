import { ApiProperty } from '@nestjs/swagger';
import { LessonSchoolResponse } from '@/lesson/dto/response/lesson-school.response';
import { Lesson } from '@/lesson/entity/lesson.entity';
import { UserPhoneNotFound } from '@/user/exception/user.exception';

export class LessonDetailResponse {
  @ApiProperty({ type: 'number', required: true, description: '채용 아이디', example: 2 })
  id: number;

  @ApiProperty({ type: 'number', required: true, description: '작성자 아이디', example: 2 })
  authorId: number;

  @ApiProperty({ type: 'string', required: true, description: '이름', example: '임성준' })
  name: string;

  @ApiProperty({ type: 'number', required: true, description: '레슨 가격', example: 100000 })
  pay: number;

  @ApiProperty({ type: 'string', required: true, description: '소개', example: '안녕하세요.' })
  introduction: string;

  @ApiProperty({ type: 'string', required: false, description: '경력', example: '정선성악콩쿨 1등' })
  career: string | null;

  @ApiProperty({ type: 'string', required: true, description: '연락처', example: '010-4028-7451' })
  phone: string;

  @ApiProperty({ type: 'string', required: true, description: '이미지 주소', example: 'https://artinfokorea.com' })
  imageUrl: string;

  @ApiProperty({ type: [LessonSchoolResponse], required: true, description: '학력 목록' })
  schools: LessonSchoolResponse[];

  @ApiProperty({ type: 'string[]', required: true, description: '지역 목록', example: ['서울', '경기'] })
  areas: string[];

  @ApiProperty({ type: 'string[]', required: true, description: '전공 목록', example: ['바이올린', '비올라'] })
  majors: string[];

  constructor(lesson: Lesson) {
    if (!lesson.user.phone) throw new UserPhoneNotFound();

    this.id = lesson.id;
    this.authorId = lesson.user.id;
    this.name = lesson.user.name;
    this.pay = lesson.pay;
    this.introduction = lesson.introduction;
    this.career = lesson.career;
    this.phone = lesson.user.phone;
    this.imageUrl = lesson.imageUrl;
    this.schools = lesson.user.schools.map(school => new LessonSchoolResponse(school));
    this.areas = lesson.areas.map(area => area.name);
    this.majors = lesson.user.userMajorCategories.map(userMajorCategory => userMajorCategory.majorCategory.koName);
  }
}
