import { RestApiController, RestApiGet } from '@/common/decorator/rest-api';
import { LessonService } from '@/lesson/lesson.service';
import { LessonDetailResponse } from '@/lesson/dto/response/lesson-detail.response';
import { Param, Query } from '@nestjs/common';
import { LessonsResponse } from '@/lesson/dto/response/lessons.response';
import { GetLessonsRequest } from '@/lesson/dto/request/get-lessons.request';

@RestApiController('/lessons', 'Lesson')
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}

  @RestApiGet(LessonDetailResponse, { path: '/:lessonId', description: '레슨 단건 조회' })
  async getLesson(@Param('lessonId') lessonId: number): Promise<LessonDetailResponse> {
    const lesson = await this.lessonService.getLessonById(lessonId);

    return new LessonDetailResponse(lesson);
  }

  @RestApiGet(LessonsResponse, { path: '/', description: '레슨 목록 조회' })
  async getLessons(@Query() request: GetLessonsRequest): Promise<LessonsResponse> {
    const lessons = await this.lessonService.getLessons(request.toGetCommand());
    const totalCount = await this.lessonService.countLessons(request.toCountCommand());

    return new LessonsResponse({ lessons: lessons, totalCount: totalCount });
  }
}
