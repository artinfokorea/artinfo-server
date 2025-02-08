import { RestApiController, RestApiDelete, RestApiGet, RestApiPost, RestApiPut } from '@/common/decorator/rest-api';
import { LessonService } from '@/lesson/lesson.service';
import { LessonDetailResponse } from '@/lesson/dto/response/lesson-detail.response';
import { Body, Param, Query } from '@nestjs/common';
import { LessonsResponse } from '@/lesson/dto/response/lessons.response';
import { GetLessonsRequest } from '@/lesson/dto/request/get-lessons.request';
import { AuthSignature } from '@/common/decorator/AuthSignature';
import { UserSignature } from '@/common/type/type';
import { USER_TYPE } from '@/user/entity/user.entity';
import { OkResponse } from '@/common/response/ok.response';
import { CreateResponse } from '@/common/response/createResponse';
import { CreateLessonRequest } from '@/lesson/dto/request/create-lesson.request';
import { EditLessonRequest } from '@/lesson/dto/request/edit-lesson.request';
import { CountLessonsResponse } from '@/lesson/dto/response/count-lessons.response';
import { CountLessonsCommand } from '@/lesson/dto/command/count-lessons.command';
import { MajorGroupsResponse } from '@/major/dto/response/major-groups.response';

@RestApiController('/lessons', 'Lesson')
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}

  @RestApiPut(OkResponse, { path: '/', description: '레슨 수정', auth: [USER_TYPE.CLIENT] })
  async editLesson(@AuthSignature() signature: UserSignature, @Body() request: EditLessonRequest): Promise<OkResponse> {
    await this.lessonService.editLesson(request.toCommand(signature.id));
    return new OkResponse();
  }

  @RestApiGet(MajorGroupsResponse, { path: '/fields', description: '레슨 분야 조회' })
  async getLessonFields(): Promise<MajorGroupsResponse> {
    const majorGroups = await this.lessonService.getLessFields();
    return new MajorGroupsResponse(majorGroups);
  }

  @RestApiDelete(OkResponse, { path: '/', description: '레슨 삭제', auth: [USER_TYPE.CLIENT] })
  async removeLesson(@AuthSignature() signature: UserSignature): Promise<OkResponse> {
    await this.lessonService.removeLesson(signature.id);
    return new OkResponse();
  }

  @RestApiPost(CreateResponse, { path: '/', description: '레슨 생성', auth: [USER_TYPE.CLIENT] })
  async createLesson(@AuthSignature() signature: UserSignature, @Body() request: CreateLessonRequest): Promise<CreateResponse> {
    const lessonId = await this.lessonService.create(request.toCommand(signature.id));
    return new CreateResponse(lessonId);
  }

  @RestApiGet(CountLessonsResponse, { path: '/count', description: '레슨 개수 조회' })
  async countLessons(): Promise<CountLessonsResponse> {
    const command = new CountLessonsCommand({
      keyword: null,
      professionalFields: [],
      provinceIds: [],
    });

    const totalCount = await this.lessonService.countLessons(command);
    return new CountLessonsResponse(totalCount);
  }

  @RestApiGet(OkResponse, { path: '/qualification', description: '레슨 생성 자격 확인', auth: [USER_TYPE.CLIENT] })
  async checkQualification(@AuthSignature() signature: UserSignature): Promise<OkResponse> {
    await this.lessonService.checkQualification(signature.id);
    return new OkResponse();
  }

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
