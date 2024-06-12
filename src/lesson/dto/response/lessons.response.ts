import { ApiProperty } from '@nestjs/swagger';
import { Lesson } from '@/lesson/entity/lesson.entity';
import { LessonResponse } from '@/lesson/dto/response/lesson.response';

export class LessonsResponse {
  @ApiProperty({ type: [LessonResponse], required: true, description: '레슨 목록' })
  lessons: LessonResponse[];

  @ApiProperty({ type: 'number', required: true, description: '총 개수', example: 5 })
  totalCount: number;

  constructor({ lessons, totalCount }: { lessons: Lesson[]; totalCount: number }) {
    this.lessons = lessons.map(lesson => new LessonResponse(lesson));
    this.totalCount = totalCount;
  }
}
