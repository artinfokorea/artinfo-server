import { Body, Param, ParseIntPipe } from '@nestjs/common';
import { RestApiController, RestApiDelete, RestApiGet, RestApiPost, RestApiPut } from '@/common/decorator/rest-api';
import { AuthSignature } from '@/common/decorator/AuthSignature';
import { UserSignature } from '@/common/type/type';
import { USER_TYPE } from '@/user/entity/user.entity';
import { OkResponse } from '@/common/response/ok.response';
import {
  OnchurchListMyNoticeCategoriesUseCase,
  OnchurchCreateMyNoticeCategoryUseCase,
  OnchurchUpdateMyNoticeCategoryUseCase,
  OnchurchDeleteMyNoticeCategoryUseCase,
} from '@/onchurch/notice/application/usecase/onchurch-notice-category.usecase';
import { OnchurchNoticeCategoryWriteRequest } from '@/onchurch/notice/presentation/dto/request/onchurch-notice-category-write.request';
import { OnchurchNoticeCategoryListResponse, OnchurchNoticeCategoryResponse } from '@/onchurch/notice/presentation/dto/response/onchurch-notice.response';

@RestApiController('/onchurch/notice-categories', 'Onchurch Notice Categories')
export class OnchurchNoticeCategoryController {
  constructor(
    private readonly listUseCase: OnchurchListMyNoticeCategoriesUseCase,
    private readonly createUseCase: OnchurchCreateMyNoticeCategoryUseCase,
    private readonly updateUseCase: OnchurchUpdateMyNoticeCategoryUseCase,
    private readonly deleteUseCase: OnchurchDeleteMyNoticeCategoryUseCase,
  ) {}

  @RestApiGet(OnchurchNoticeCategoryListResponse, { path: '/me', description: '내 교회 공지 카테고리 목록', auth: [USER_TYPE.CLIENT] })
  async listMine(@AuthSignature() s: UserSignature) {
    return new OnchurchNoticeCategoryListResponse(await this.listUseCase.execute(s.id));
  }

  @RestApiPost(OnchurchNoticeCategoryResponse, { path: '/me', description: '카테고리 추가', auth: [USER_TYPE.CLIENT] })
  async createMine(@AuthSignature() s: UserSignature, @Body() req: OnchurchNoticeCategoryWriteRequest) {
    return new OnchurchNoticeCategoryResponse(await this.createUseCase.execute(s.id, req.toCommand()));
  }

  @RestApiPut(OnchurchNoticeCategoryResponse, { path: '/me/:id', description: '카테고리 수정', auth: [USER_TYPE.CLIENT] })
  async updateMine(@AuthSignature() s: UserSignature, @Param('id', ParseIntPipe) id: number, @Body() req: OnchurchNoticeCategoryWriteRequest) {
    return new OnchurchNoticeCategoryResponse(await this.updateUseCase.execute(s.id, id, req.toCommand()));
  }

  @RestApiDelete(OkResponse, { path: '/me/:id', description: '카테고리 삭제', auth: [USER_TYPE.CLIENT] })
  async deleteMine(@AuthSignature() s: UserSignature, @Param('id', ParseIntPipe) id: number) {
    await this.deleteUseCase.execute(s.id, id);
    return new OkResponse();
  }
}
