import { Body, Param, ParseIntPipe } from '@nestjs/common';
import { RestApiController, RestApiDelete, RestApiGet, RestApiPost, RestApiPut } from '@/common/decorator/rest-api';
import { AuthSignature } from '@/common/decorator/AuthSignature';
import { UserSignature } from '@/common/type/type';
import { USER_TYPE } from '@/user/entity/user.entity';
import { OkResponse } from '@/common/response/ok.response';
import {
  OnchurchListMyCommunityCategoriesUseCase,
  OnchurchCreateMyCommunityCategoryUseCase,
  OnchurchUpdateMyCommunityCategoryUseCase,
  OnchurchDeleteMyCommunityCategoryUseCase,
} from '@/onchurch/community/application/usecase/onchurch-community-category.usecase';
import { OnchurchCommunityCategoryWriteRequest } from '@/onchurch/community/presentation/dto/request/onchurch-community-category-write.request';
import { OnchurchCommunityCategoryListResponse, OnchurchCommunityCategoryResponse } from '@/onchurch/community/presentation/dto/response/onchurch-community.response';

@RestApiController('/onchurch/community-categories', 'Onchurch Community Categories')
export class OnchurchCommunityCategoryController {
  constructor(
    private readonly listUseCase: OnchurchListMyCommunityCategoriesUseCase,
    private readonly createUseCase: OnchurchCreateMyCommunityCategoryUseCase,
    private readonly updateUseCase: OnchurchUpdateMyCommunityCategoryUseCase,
    private readonly deleteUseCase: OnchurchDeleteMyCommunityCategoryUseCase,
  ) {}

  @RestApiGet(OnchurchCommunityCategoryListResponse, { path: '/me', description: '내 교회 교제 카테고리 목록', auth: [USER_TYPE.CLIENT] })
  async listMine(@AuthSignature() s: UserSignature) {
    return new OnchurchCommunityCategoryListResponse(await this.listUseCase.execute(s.id));
  }

  @RestApiPost(OnchurchCommunityCategoryResponse, { path: '/me', description: '카테고리 추가', auth: [USER_TYPE.CLIENT] })
  async createMine(@AuthSignature() s: UserSignature, @Body() req: OnchurchCommunityCategoryWriteRequest) {
    return new OnchurchCommunityCategoryResponse(await this.createUseCase.execute(s.id, req.toCommand()));
  }

  @RestApiPut(OnchurchCommunityCategoryResponse, { path: '/me/:id', description: '카테고리 수정', auth: [USER_TYPE.CLIENT] })
  async updateMine(@AuthSignature() s: UserSignature, @Param('id', ParseIntPipe) id: number, @Body() req: OnchurchCommunityCategoryWriteRequest) {
    return new OnchurchCommunityCategoryResponse(await this.updateUseCase.execute(s.id, id, req.toCommand()));
  }

  @RestApiDelete(OkResponse, { path: '/me/:id', description: '카테고리 삭제', auth: [USER_TYPE.CLIENT] })
  async deleteMine(@AuthSignature() s: UserSignature, @Param('id', ParseIntPipe) id: number) {
    await this.deleteUseCase.execute(s.id, id);
    return new OkResponse();
  }
}
