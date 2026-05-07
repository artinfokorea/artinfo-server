import { Body, Param, ParseIntPipe } from '@nestjs/common';
import { RestApiController, RestApiDelete, RestApiGet, RestApiPost, RestApiPut } from '@/common/decorator/rest-api';
import { AuthSignature } from '@/common/decorator/AuthSignature';
import { UserSignature } from '@/common/type/type';
import { USER_TYPE } from '@/user/entity/user.entity';
import { OkResponse } from '@/common/response/ok.response';
import {
  OnchurchListMyHistoriesUseCase,
  OnchurchCreateMyHistoryUseCase,
  OnchurchUpdateMyHistoryUseCase,
  OnchurchDeleteMyHistoryUseCase,
} from '@/onchurch/about/application/usecase/onchurch-history.usecase';
import { OnchurchHistoryWriteRequest } from '@/onchurch/about/presentation/dto/request/onchurch-history-write.request';
import { OnchurchHistoryListResponse, OnchurchHistoryResponse } from '@/onchurch/about/presentation/dto/response/onchurch-about.response';

@RestApiController('/onchurch/histories', 'Onchurch History')
export class OnchurchHistoryController {
  constructor(
    private readonly listUseCase: OnchurchListMyHistoriesUseCase,
    private readonly createUseCase: OnchurchCreateMyHistoryUseCase,
    private readonly updateUseCase: OnchurchUpdateMyHistoryUseCase,
    private readonly deleteUseCase: OnchurchDeleteMyHistoryUseCase,
  ) {}

  @RestApiGet(OnchurchHistoryListResponse, { path: '/me', description: '내 교회 연혁 목록', auth: [USER_TYPE.CLIENT] })
  async listMine(@AuthSignature() s: UserSignature) {
    return new OnchurchHistoryListResponse(await this.listUseCase.execute(s.id));
  }

  @RestApiPost(OnchurchHistoryResponse, { path: '/me', description: '연혁 추가', auth: [USER_TYPE.CLIENT] })
  async createMine(@AuthSignature() s: UserSignature, @Body() req: OnchurchHistoryWriteRequest) {
    return new OnchurchHistoryResponse(await this.createUseCase.execute(s.id, req.toCommand()));
  }

  @RestApiPut(OnchurchHistoryResponse, { path: '/me/:id', description: '연혁 수정', auth: [USER_TYPE.CLIENT] })
  async updateMine(@AuthSignature() s: UserSignature, @Param('id', ParseIntPipe) id: number, @Body() req: OnchurchHistoryWriteRequest) {
    return new OnchurchHistoryResponse(await this.updateUseCase.execute(s.id, id, req.toCommand()));
  }

  @RestApiDelete(OkResponse, { path: '/me/:id', description: '연혁 삭제', auth: [USER_TYPE.CLIENT] })
  async deleteMine(@AuthSignature() s: UserSignature, @Param('id', ParseIntPipe) id: number) {
    await this.deleteUseCase.execute(s.id, id);
    return new OkResponse();
  }
}
