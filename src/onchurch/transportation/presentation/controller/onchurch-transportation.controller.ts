import { Body, Param, ParseIntPipe } from '@nestjs/common';
import { RestApiController, RestApiDelete, RestApiGet, RestApiPost, RestApiPut } from '@/common/decorator/rest-api';
import { AuthSignature } from '@/common/decorator/AuthSignature';
import { UserSignature } from '@/common/type/type';
import { USER_TYPE } from '@/user/entity/user.entity';
import { OkResponse } from '@/common/response/ok.response';
import { OnchurchListMyTransportationsUseCase } from '@/onchurch/transportation/application/usecase/onchurch-list-my-transportations.usecase';
import { OnchurchCreateMyTransportationUseCase } from '@/onchurch/transportation/application/usecase/onchurch-create-my-transportation.usecase';
import { OnchurchUpdateMyTransportationUseCase } from '@/onchurch/transportation/application/usecase/onchurch-update-my-transportation.usecase';
import { OnchurchDeleteMyTransportationUseCase } from '@/onchurch/transportation/application/usecase/onchurch-delete-my-transportation.usecase';
import { OnchurchTransportationWriteRequest } from '@/onchurch/transportation/presentation/dto/request/onchurch-transportation-write.request';
import { OnchurchTransportationListResponse, OnchurchTransportationResponse } from '@/onchurch/transportation/presentation/dto/response/onchurch-transportation.response';

@RestApiController('/onchurch/transportations', 'Onchurch Transportation')
export class OnchurchTransportationController {
  constructor(
    private readonly listUseCase: OnchurchListMyTransportationsUseCase,
    private readonly createUseCase: OnchurchCreateMyTransportationUseCase,
    private readonly updateUseCase: OnchurchUpdateMyTransportationUseCase,
    private readonly deleteUseCase: OnchurchDeleteMyTransportationUseCase,
  ) {}

  @RestApiGet(OnchurchTransportationListResponse, { path: '/me', description: '내 교회의 교통편 목록 조회 (관리자)', auth: [USER_TYPE.CLIENT] })
  async listMine(@AuthSignature() signature: UserSignature) {
    const items = await this.listUseCase.execute(signature.id);
    return new OnchurchTransportationListResponse(items);
  }

  @RestApiPost(OnchurchTransportationResponse, { path: '/me', description: '내 교회 교통편 생성', auth: [USER_TYPE.CLIENT] })
  async createMine(@AuthSignature() signature: UserSignature, @Body() request: OnchurchTransportationWriteRequest) {
    const item = await this.createUseCase.execute(signature.id, request.toCommand());
    return new OnchurchTransportationResponse(item);
  }

  @RestApiPut(OnchurchTransportationResponse, { path: '/me/:id', description: '내 교회 교통편 수정', auth: [USER_TYPE.CLIENT] })
  async updateMine(
    @AuthSignature() signature: UserSignature,
    @Param('id', ParseIntPipe) id: number,
    @Body() request: OnchurchTransportationWriteRequest,
  ) {
    const item = await this.updateUseCase.execute(signature.id, id, request.toCommand());
    return new OnchurchTransportationResponse(item);
  }

  @RestApiDelete(OkResponse, { path: '/me/:id', description: '내 교회 교통편 삭제', auth: [USER_TYPE.CLIENT] })
  async deleteMine(@AuthSignature() signature: UserSignature, @Param('id', ParseIntPipe) id: number) {
    await this.deleteUseCase.execute(signature.id, id);
    return new OkResponse();
  }
}
