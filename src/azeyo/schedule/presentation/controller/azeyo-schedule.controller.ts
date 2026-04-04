import { Body, Param, Query } from '@nestjs/common';
import { RestApiController, RestApiGet, RestApiPost, RestApiPut, RestApiDelete } from '@/common/decorator/rest-api';
import { AuthSignature } from '@/common/decorator/AuthSignature';
import { UserSignature } from '@/common/type/type';
import { USER_TYPE } from '@/user/entity/user.entity';
import { OkResponse } from '@/common/response/ok.response';
import { CreateResponse } from '@/common/response/createResponse';
import { AzeyoCreateScheduleUseCase } from '@/azeyo/schedule/application/usecase/azeyo-create-schedule.usecase';
import { AzeyoScanSchedulesUseCase } from '@/azeyo/schedule/application/usecase/azeyo-scan-schedules.usecase';
import { AzeyoUpdateScheduleUseCase } from '@/azeyo/schedule/application/usecase/azeyo-update-schedule.usecase';
import { AzeyoDeleteScheduleUseCase } from '@/azeyo/schedule/application/usecase/azeyo-delete-schedule.usecase';
import { AzeyoScanScheduleTagsUseCase } from '@/azeyo/schedule/application/usecase/azeyo-scan-schedule-tags.usecase';
import { AzeyoCreateScheduleTagUseCase } from '@/azeyo/schedule/application/usecase/azeyo-create-schedule-tag.usecase';
import { AzeyoScanScheduleRecommendationsUseCase } from '@/azeyo/schedule/application/usecase/azeyo-scan-schedule-recommendations.usecase';
import { AzeyoCreateScheduleRequest } from '@/azeyo/schedule/presentation/dto/request/azeyo-create-schedule.request';
import { AzeyoCreateScheduleTagRequest } from '@/azeyo/schedule/presentation/dto/request/azeyo-create-schedule-tag.request';
import { AzeyoSchedulesResponse, AzeyoScheduleTagsResponse } from '@/azeyo/schedule/presentation/dto/response/azeyo-schedule.response';
import { AzeyoScheduleRecommendationsResponse } from '@/azeyo/schedule/presentation/dto/response/azeyo-schedule-recommendation.response';

@RestApiController('/azeyo/schedules', 'Azeyo Schedule')
export class AzeyoScheduleController {
  constructor(
    private readonly createScheduleUseCase: AzeyoCreateScheduleUseCase,
    private readonly scanSchedulesUseCase: AzeyoScanSchedulesUseCase,
    private readonly updateScheduleUseCase: AzeyoUpdateScheduleUseCase,
    private readonly deleteScheduleUseCase: AzeyoDeleteScheduleUseCase,
    private readonly scanTagsUseCase: AzeyoScanScheduleTagsUseCase,
    private readonly createTagUseCase: AzeyoCreateScheduleTagUseCase,
    private readonly scanRecommendationsUseCase: AzeyoScanScheduleRecommendationsUseCase,
  ) {}

  // === Schedules ===

  @RestApiGet(AzeyoSchedulesResponse, { path: '/', description: '일정 목록 조회', auth: [USER_TYPE.CLIENT] })
  async scanSchedules(@AuthSignature() signature: UserSignature) {
    const schedules = await this.scanSchedulesUseCase.execute(signature.id);
    return new AzeyoSchedulesResponse(schedules);
  }

  @RestApiPost(CreateResponse, { path: '/', description: '일정 등록', auth: [USER_TYPE.CLIENT] })
  async createSchedule(@AuthSignature() signature: UserSignature, @Body() request: AzeyoCreateScheduleRequest) {
    const id = await this.createScheduleUseCase.execute(request.toCommand(signature.id));
    return new CreateResponse(id);
  }

  @RestApiPut(OkResponse, { path: '/:scheduleId', description: '일정 수정', auth: [USER_TYPE.CLIENT] })
  async updateSchedule(@AuthSignature() signature: UserSignature, @Param('scheduleId') scheduleId: number, @Body() request: AzeyoCreateScheduleRequest) {
    await this.updateScheduleUseCase.execute(scheduleId, request.toCommand(signature.id));
    return new OkResponse();
  }

  @RestApiDelete(OkResponse, { path: '/:scheduleId', description: '일정 삭제', auth: [USER_TYPE.CLIENT] })
  async deleteSchedule(@AuthSignature() signature: UserSignature, @Param('scheduleId') scheduleId: number) {
    await this.deleteScheduleUseCase.execute(scheduleId, signature.id);
    return new OkResponse();
  }

  // === Tags ===

  @RestApiGet(AzeyoScheduleTagsResponse, { path: '/tags', description: '태그 목록 조회', auth: [USER_TYPE.CLIENT] })
  async scanTags(@AuthSignature() signature: UserSignature) {
    const tags = await this.scanTagsUseCase.execute(signature.id);
    return new AzeyoScheduleTagsResponse(tags);
  }

  @RestApiPost(CreateResponse, { path: '/tags', description: '커스텀 태그 생성', auth: [USER_TYPE.CLIENT] })
  async createTag(@AuthSignature() signature: UserSignature, @Body() request: AzeyoCreateScheduleTagRequest) {
    const id = await this.createTagUseCase.execute(signature.id, request.name, request.color);
    return new CreateResponse(id);
  }

  // === Recommendations ===

  @RestApiGet(AzeyoScheduleRecommendationsResponse, { path: '/recommendations', description: '태그 기반 추천 조회', auth: [USER_TYPE.CLIENT] })
  async scanRecommendations(@AuthSignature() _signature: UserSignature, @Query('tagIds') tagIds: string) {
    const ids = tagIds ? tagIds.split(',').map(Number).filter(n => !isNaN(n)) : [];
    const recommendations = await this.scanRecommendationsUseCase.execute(ids);
    return new AzeyoScheduleRecommendationsResponse(recommendations);
  }
}
