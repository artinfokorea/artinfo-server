import { Body, Param, ParseIntPipe } from '@nestjs/common';
import { RestApiController, RestApiDelete, RestApiGet, RestApiPost, RestApiPut } from '@/common/decorator/rest-api';
import { AuthSignature } from '@/common/decorator/AuthSignature';
import { UserSignature } from '@/common/type/type';
import { USER_TYPE } from '@/user/entity/user.entity';
import { OkResponse } from '@/common/response/ok.response';
import {
  OnchurchListMyWorshipServicesUseCase,
  OnchurchCreateMyWorshipServiceUseCase,
  OnchurchUpdateMyWorshipServiceUseCase,
  OnchurchDeleteMyWorshipServiceUseCase,
} from '@/onchurch/worship/application/usecase/onchurch-worship-service.usecase';
import { OnchurchWorshipServiceWriteRequest } from '@/onchurch/worship/presentation/dto/request/onchurch-worship-service-write.request';
import { OnchurchWorshipServiceListResponse, OnchurchWorshipServiceResponse } from '@/onchurch/worship/presentation/dto/response/onchurch-worship.response';

@RestApiController('/onchurch/worship-services', 'Onchurch Worship Service')
export class OnchurchWorshipServiceController {
  constructor(
    private readonly listUseCase: OnchurchListMyWorshipServicesUseCase,
    private readonly createUseCase: OnchurchCreateMyWorshipServiceUseCase,
    private readonly updateUseCase: OnchurchUpdateMyWorshipServiceUseCase,
    private readonly deleteUseCase: OnchurchDeleteMyWorshipServiceUseCase,
  ) {}

  @RestApiGet(OnchurchWorshipServiceListResponse, { path: '/me', description: '내 교회 예배 시간표 목록', auth: [USER_TYPE.CLIENT] })
  async listMine(@AuthSignature() s: UserSignature) {
    return new OnchurchWorshipServiceListResponse(await this.listUseCase.execute(s.id));
  }

  @RestApiPost(OnchurchWorshipServiceResponse, { path: '/me', description: '예배 추가', auth: [USER_TYPE.CLIENT] })
  async createMine(@AuthSignature() s: UserSignature, @Body() req: OnchurchWorshipServiceWriteRequest) {
    return new OnchurchWorshipServiceResponse(await this.createUseCase.execute(s.id, req.toCommand()));
  }

  @RestApiPut(OnchurchWorshipServiceResponse, { path: '/me/:id', description: '예배 수정', auth: [USER_TYPE.CLIENT] })
  async updateMine(@AuthSignature() s: UserSignature, @Param('id', ParseIntPipe) id: number, @Body() req: OnchurchWorshipServiceWriteRequest) {
    return new OnchurchWorshipServiceResponse(await this.updateUseCase.execute(s.id, id, req.toCommand()));
  }

  @RestApiDelete(OkResponse, { path: '/me/:id', description: '예배 삭제', auth: [USER_TYPE.CLIENT] })
  async deleteMine(@AuthSignature() s: UserSignature, @Param('id', ParseIntPipe) id: number) {
    await this.deleteUseCase.execute(s.id, id);
    return new OkResponse();
  }
}
