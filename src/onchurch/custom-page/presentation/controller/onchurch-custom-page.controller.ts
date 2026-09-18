import { Body, Param, ParseIntPipe } from '@nestjs/common';
import { RestApiController, RestApiDelete, RestApiGet, RestApiPost, RestApiPut } from '@/common/decorator/rest-api';
import { AuthSignature } from '@/common/decorator/AuthSignature';
import { UserSignature } from '@/common/type/type';
import { USER_TYPE } from '@/user/entity/user.entity';
import { OkResponse } from '@/common/response/ok.response';
import {
  OnchurchListMyCustomPagesUseCase,
  OnchurchCreateMyCustomPageUseCase,
  OnchurchUpdateMyCustomPageUseCase,
  OnchurchToggleMyCustomPageUseCase,
  OnchurchReorderMyCustomPagesUseCase,
  OnchurchDeleteMyCustomPageUseCase,
} from '@/onchurch/custom-page/application/usecase/onchurch-custom-page.usecase';
import {
  OnchurchCustomPageWriteRequest,
  OnchurchCustomPageToggleRequest,
  OnchurchCustomPageReorderRequest,
} from '@/onchurch/custom-page/presentation/dto/request/onchurch-custom-page-write.request';
import { OnchurchCustomPageListResponse, OnchurchCustomPageResponse } from '@/onchurch/custom-page/presentation/dto/response/onchurch-custom-page.response';

@RestApiController('/onchurch/custom-pages', 'Onchurch Custom Page')
export class OnchurchCustomPageController {
  constructor(
    private readonly listUseCase: OnchurchListMyCustomPagesUseCase,
    private readonly createUseCase: OnchurchCreateMyCustomPageUseCase,
    private readonly updateUseCase: OnchurchUpdateMyCustomPageUseCase,
    private readonly toggleUseCase: OnchurchToggleMyCustomPageUseCase,
    private readonly reorderUseCase: OnchurchReorderMyCustomPagesUseCase,
    private readonly deleteUseCase: OnchurchDeleteMyCustomPageUseCase,
  ) {}

  @RestApiGet(OnchurchCustomPageListResponse, { path: '/me', description: '내 교회의 커스텀 페이지 목록 (어드민)', auth: [USER_TYPE.CLIENT] })
  async listMine(@AuthSignature() signature: UserSignature) {
    return new OnchurchCustomPageListResponse(await this.listUseCase.execute(signature.id));
  }

  @RestApiPost(OnchurchCustomPageResponse, { path: '/me', description: '커스텀 페이지 생성', auth: [USER_TYPE.CLIENT] })
  async createMine(@AuthSignature() signature: UserSignature, @Body() request: OnchurchCustomPageWriteRequest) {
    return new OnchurchCustomPageResponse(await this.createUseCase.execute(signature.id, request.toCommand()));
  }

  @RestApiPut(OnchurchCustomPageResponse, { path: '/me/:id', description: '커스텀 페이지 수정', auth: [USER_TYPE.CLIENT] })
  async updateMine(@AuthSignature() signature: UserSignature, @Param('id', ParseIntPipe) id: number, @Body() request: OnchurchCustomPageWriteRequest) {
    return new OnchurchCustomPageResponse(await this.updateUseCase.execute(signature.id, id, request.toCommand()));
  }

  @RestApiPut(OnchurchCustomPageResponse, { path: '/me/:id/active', description: '커스텀 페이지 노출 on/off', auth: [USER_TYPE.CLIENT] })
  async toggleMine(@AuthSignature() signature: UserSignature, @Param('id', ParseIntPipe) id: number, @Body() request: OnchurchCustomPageToggleRequest) {
    return new OnchurchCustomPageResponse(await this.toggleUseCase.execute(signature.id, id, request.isActive));
  }

  @RestApiPut(OnchurchCustomPageListResponse, { path: '/me/reorder', description: '커스텀 페이지 노출 순서 변경', auth: [USER_TYPE.CLIENT] })
  async reorderMine(@AuthSignature() signature: UserSignature, @Body() request: OnchurchCustomPageReorderRequest) {
    return new OnchurchCustomPageListResponse(await this.reorderUseCase.execute(signature.id, request.orderedIds ?? []));
  }

  @RestApiDelete(OkResponse, { path: '/me/:id', description: '커스텀 페이지 삭제', auth: [USER_TYPE.CLIENT] })
  async deleteMine(@AuthSignature() signature: UserSignature, @Param('id', ParseIntPipe) id: number) {
    await this.deleteUseCase.execute(signature.id, id);
    return new OkResponse();
  }
}
