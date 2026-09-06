import { Body, Param, ParseIntPipe, Query } from '@nestjs/common';
import { RestApiController, RestApiDelete, RestApiGet, RestApiPost, RestApiPut } from '@/common/decorator/rest-api';
import { AuthSignature } from '@/common/decorator/AuthSignature';
import { UserSignature } from '@/common/type/type';
import { USER_TYPE } from '@/user/entity/user.entity';
import { OkResponse } from '@/common/response/ok.response';
import {
  OngiCreateEventUseCase,
  OngiDeleteEventUseCase,
  OngiScanEventsUseCase,
  OngiUpdateEventUseCase,
} from '@/ongi/event/application/usecase/ongi-event.usecase';
import { OngiInvalidEventDate } from '@/ongi/event/domain/exception/ongi-event.exception';
import { OngiSaveEventRequest } from '@/ongi/event/presentation/dto/request/ongi-save-event.request';
import { OngiEventListResponse, OngiEventResponse } from '@/ongi/event/presentation/dto/response/ongi-event.response';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function inputOf(request: OngiSaveEventRequest) {
  return {
    title: request.title.trim(),
    date: request.date,
    time: request.time ?? null,
    calendarType: request.calendarType,
    repeatType: request.repeatType,
    memo: request.memo?.trim() || null,
    notifyUserIds: request.notifyUserIds,
  };
}

@RestApiController('/ongi/groups', 'Ongi Event')
export class OngiEventController {
  constructor(
    private readonly scanEventsUseCase: OngiScanEventsUseCase,
    private readonly createEventUseCase: OngiCreateEventUseCase,
  ) {}

  @RestApiGet(OngiEventListResponse, { path: '/:groupId/events', description: '기간 내 일정 발생일 목록 (from~to, 양력)', auth: [USER_TYPE.CLIENT] })
  async scanEvents(
    @AuthSignature() signature: UserSignature,
    @Param('groupId', ParseIntPipe) groupId: number,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    if (!DATE_PATTERN.test(from ?? '') || !DATE_PATTERN.test(to ?? '')) throw new OngiInvalidEventDate();

    const views = await this.scanEventsUseCase.execute(signature.id, groupId, from, to);

    return new OngiEventListResponse(views);
  }

  @RestApiPost(OngiEventResponse, { path: '/:groupId/events', description: '일정 만들기 — 알림 대상에게 등록 푸시', auth: [USER_TYPE.CLIENT] })
  async createEvent(@AuthSignature() signature: UserSignature, @Param('groupId', ParseIntPipe) groupId: number, @Body() request: OngiSaveEventRequest) {
    const view = await this.createEventUseCase.execute(signature.id, groupId, inputOf(request));

    return new OngiEventResponse(view);
  }
}

/** 일정 단건 조작 — 경로가 그룹이 아니라 일정 기준이라 컨트롤러 분리 */
@RestApiController('/ongi/events', 'Ongi Event')
export class OngiEventItemController {
  constructor(
    private readonly updateEventUseCase: OngiUpdateEventUseCase,
    private readonly deleteEventUseCase: OngiDeleteEventUseCase,
  ) {}

  @RestApiPut(OngiEventResponse, { path: '/:eventId', description: '일정 수정 — 만든 사람·관리자만, 알림 대상에게 변경 푸시', auth: [USER_TYPE.CLIENT] })
  async updateEvent(@AuthSignature() signature: UserSignature, @Param('eventId', ParseIntPipe) eventId: number, @Body() request: OngiSaveEventRequest) {
    const view = await this.updateEventUseCase.execute(signature.id, eventId, inputOf(request));

    return new OngiEventResponse(view);
  }

  @RestApiDelete(OkResponse, { path: '/:eventId', description: '일정 삭제 — 남은 리마인드도 함께 취소', auth: [USER_TYPE.CLIENT] })
  async deleteEvent(@AuthSignature() signature: UserSignature, @Param('eventId', ParseIntPipe) eventId: number) {
    await this.deleteEventUseCase.execute(signature.id, eventId);

    return new OkResponse();
  }
}
