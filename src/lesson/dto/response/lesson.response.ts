import { ApiProperty } from '@nestjs/swagger';
import { Lesson } from '@/lesson/entity/lesson.entity';

export class LessonResponse {
  @ApiProperty({ type: 'number', required: true, description: '채용 아이디', example: 2 })
  id: number;

  @ApiProperty({ type: 'string', required: true, description: '이름', example: '임성준' })
  name: string;

  @ApiProperty({ type: 'string', required: true, description: '지역', example: '서울' })
  province: string;

  @ApiProperty({ type: 'string', required: true, description: '전공', example: '전공' })
  major: string;

  @ApiProperty({ type: 'string', required: true, description: '이미지 주소', example: 'https://artinfokorea.com' })
  imageUrl: string;

  constructor(lesson: Lesson) {
    this.id = lesson.id;
    this.name = lesson.user.name;
    this.imageUrl = lesson.imageUrl;
    this.province = lesson.provinces[0].name;
    this.major = lesson.user.userMajorCategories[0].majorCategory.koName;
  }
}
