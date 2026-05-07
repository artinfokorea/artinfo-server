import { Body, Param, ParseIntPipe } from '@nestjs/common';
import { RestApiController, RestApiDelete, RestApiGet, RestApiPost, RestApiPut } from '@/common/decorator/rest-api';
import { AuthSignature } from '@/common/decorator/AuthSignature';
import { UserSignature } from '@/common/type/type';
import { USER_TYPE } from '@/user/entity/user.entity';
import { OkResponse } from '@/common/response/ok.response';
import { OnchurchListMyEventsUseCase } from '@/onchurch/event/application/usecase/onchurch-list-my-events.usecase';
import { OnchurchCreateMyEventUseCase } from '@/onchurch/event/application/usecase/onchurch-create-my-event.usecase';
import { OnchurchUpdateMyEventUseCase } from '@/onchurch/event/application/usecase/onchurch-update-my-event.usecase';
import { OnchurchDeleteMyEventUseCase } from '@/onchurch/event/application/usecase/onchurch-delete-my-event.usecase';
import { OnchurchEventWriteRequest } from '@/onchurch/event/presentation/dto/request/onchurch-event-write.request';
import { OnchurchEventListResponse, OnchurchEventResponse } from '@/onchurch/event/presentation/dto/response/onchurch-event.response';

@RestApiController('/onchurch/events', 'Onchurch Event')
export class OnchurchEventController {
  constructor(
    private readonly listUseCase: OnchurchListMyEventsUseCase,
    private readonly createUseCase: OnchurchCreateMyEventUseCase,
    private readonly updateUseCase: OnchurchUpdateMyEventUseCase,
    private readonly deleteUseCase: OnchurchDeleteMyEventUseCase,
  ) {}

  @RestApiGet(OnchurchEventListResponse, { path: '/me', description: '내 교회의 일정 목록 (어드민)', auth: [USER_TYPE.CLIENT] })
  async listMine(@AuthSignature() signature: UserSignature) {
    const events = await this.listUseCase.execute(signature.id);
    return new OnchurchEventListResponse(events);
  }

  @RestApiPost(OnchurchEventResponse, { path: '/me', description: '내 교회 일정 생성', auth: [USER_TYPE.CLIENT] })
  async createMine(@AuthSignature() signature: UserSignature, @Body() request: OnchurchEventWriteRequest) {
    const event = await this.createUseCase.execute(signature.id, request.toCommand());
    return new OnchurchEventResponse(event);
  }

  @RestApiPut(OnchurchEventResponse, { path: '/me/:id', description: '내 교회 일정 수정', auth: [USER_TYPE.CLIENT] })
  async updateMine(
    @AuthSignature() signature: UserSignature,
    @Param('id', ParseIntPipe) id: number,
    @Body() request: OnchurchEventWriteRequest,
  ) {
    const event = await this.updateUseCase.execute(signature.id, id, request.toCommand());
    return new OnchurchEventResponse(event);
  }

  @RestApiDelete(OkResponse, { path: '/me/:id', description: '내 교회 일정 삭제', auth: [USER_TYPE.CLIENT] })
  async deleteMine(@AuthSignature() signature: UserSignature, @Param('id', ParseIntPipe) id: number) {
    await this.deleteUseCase.execute(signature.id, id);
    return new OkResponse();
  }
}
