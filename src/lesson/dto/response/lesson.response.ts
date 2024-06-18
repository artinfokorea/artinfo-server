import { ApiProperty } from '@nestjs/swagger';
import { Lesson } from '@/lesson/entity/lesson.entity';

export class LessonResponse {
  @ApiProperty({ type: 'number', required: true, description: '채용 아이디', example: 2 })
  id: number;

  @ApiProperty({ type: 'number', required: true, description: '작성자 아이디', example: 2 })
  authorId: number;

  @ApiProperty({ type: 'string', required: true, description: '이름', example: '임성준' })
  name: string;

  @ApiProperty({ type: 'string', required: true, description: '지역', example: '서울' })
  area: string;

  @ApiProperty({ type: 'string', required: true, description: '전공', example: '전공' })
  major: string;

  @ApiProperty({ type: 'string', required: true, description: '이미지 주소', example: 'https://artinfokorea.com' })
  imageUrl: string;

  constructor(lesson: Lesson) {
    this.id = lesson.id;
    this.authorId = lesson.user.id;
    this.name = lesson.user.name;
    this.imageUrl = lesson.imageUrl;
    this.area = lesson.areas[0].name;
    this.major = lesson.user.userMajorCategories[0].majorCategory.koName;
  }
}
