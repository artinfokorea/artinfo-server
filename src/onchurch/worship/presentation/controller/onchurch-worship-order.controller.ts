import { Body, Param, ParseIntPipe } from '@nestjs/common';
import { RestApiController, RestApiDelete, RestApiGet, RestApiPost, RestApiPut } from '@/common/decorator/rest-api';
import { AuthSignature } from '@/common/decorator/AuthSignature';
import { UserSignature } from '@/common/type/type';
import { USER_TYPE } from '@/user/entity/user.entity';
import { OkResponse } from '@/common/response/ok.response';
import {
  OnchurchListMyWorshipOrdersUseCase,
  OnchurchCreateMyWorshipOrderUseCase,
  OnchurchUpdateMyWorshipOrderUseCase,
  OnchurchDeleteMyWorshipOrderUseCase,
} from '@/onchurch/worship/application/usecase/onchurch-worship-order.usecase';
import { OnchurchWorshipOrderWriteRequest } from '@/onchurch/worship/presentation/dto/request/onchurch-worship-order-write.request';
import { OnchurchWorshipOrderListResponse, OnchurchWorshipOrderResponse } from '@/onchurch/worship/presentation/dto/response/onchurch-worship.response';

@RestApiController('/onchurch/worship-orders', 'Onchurch Worship Order')
export class OnchurchWorshipOrderController {
  constructor(
    private readonly listUseCase: OnchurchListMyWorshipOrdersUseCase,
    private readonly createUseCase: OnchurchCreateMyWorshipOrderUseCase,
    private readonly updateUseCase: OnchurchUpdateMyWorshipOrderUseCase,
    private readonly deleteUseCase: OnchurchDeleteMyWorshipOrderUseCase,
  ) {}

  @RestApiGet(OnchurchWorshipOrderListResponse, { path: '/me', description: '내 교회 예배 순서 목록', auth: [USER_TYPE.CLIENT] })
  async listMine(@AuthSignature() s: UserSignature) {
    return new OnchurchWorshipOrderListResponse(await this.listUseCase.execute(s.id));
  }

  @RestApiPost(OnchurchWorshipOrderResponse, { path: '/me', description: '예배 순서 추가', auth: [USER_TYPE.CLIENT] })
  async createMine(@AuthSignature() s: UserSignature, @Body() req: OnchurchWorshipOrderWriteRequest) {
    return new OnchurchWorshipOrderResponse(await this.createUseCase.execute(s.id, req.toCommand()));
  }

  @RestApiPut(OnchurchWorshipOrderResponse, { path: '/me/:id', description: '예배 순서 수정', auth: [USER_TYPE.CLIENT] })
  async updateMine(@AuthSignature() s: UserSignature, @Param('id', ParseIntPipe) id: number, @Body() req: OnchurchWorshipOrderWriteRequest) {
    return new OnchurchWorshipOrderResponse(await this.updateUseCase.execute(s.id, id, req.toCommand()));
  }

  @RestApiDelete(OkResponse, { path: '/me/:id', description: '예배 순서 삭제', auth: [USER_TYPE.CLIENT] })
  async deleteMine(@AuthSignature() s: UserSignature, @Param('id', ParseIntPipe) id: number) {
    await this.deleteUseCase.execute(s.id, id);
    return new OkResponse();
  }
}
