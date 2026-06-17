import { Body, Param, ParseIntPipe } from '@nestjs/common';
import { RestApiController, RestApiDelete, RestApiGet, RestApiPost, RestApiPut } from '@/common/decorator/rest-api';
import { AuthSignature } from '@/common/decorator/AuthSignature';
import { UserSignature } from '@/common/type/type';
import { USER_TYPE } from '@/user/entity/user.entity';
import { OkResponse } from '@/common/response/ok.response';
import {
  OnchurchListMyGalleryCategoriesUseCase,
  OnchurchCreateMyGalleryCategoryUseCase,
  OnchurchUpdateMyGalleryCategoryUseCase,
  OnchurchDeleteMyGalleryCategoryUseCase,
  OnchurchRestoreMyGalleryAllCategoryUseCase,
} from '@/onchurch/gallery/application/usecase/onchurch-gallery-category.usecase';
import { OnchurchGalleryCategoryWriteRequest } from '@/onchurch/gallery/presentation/dto/request/onchurch-gallery-category-write.request';
import { OnchurchGalleryCategoryListResponse, OnchurchGalleryCategoryResponse } from '@/onchurch/gallery/presentation/dto/response/onchurch-gallery.response';

@RestApiController('/onchurch/gallery-categories', 'Onchurch Gallery Category')
export class OnchurchGalleryCategoryController {
  constructor(
    private readonly listUseCase: OnchurchListMyGalleryCategoriesUseCase,
    private readonly createUseCase: OnchurchCreateMyGalleryCategoryUseCase,
    private readonly updateUseCase: OnchurchUpdateMyGalleryCategoryUseCase,
    private readonly deleteUseCase: OnchurchDeleteMyGalleryCategoryUseCase,
    private readonly restoreAllUseCase: OnchurchRestoreMyGalleryAllCategoryUseCase,
  ) {}

  @RestApiGet(OnchurchGalleryCategoryListResponse, { path: '/me', description: '내 교회 갤러리 카테고리 목록', auth: [USER_TYPE.CLIENT] })
  async listMine(@AuthSignature() s: UserSignature) {
    return new OnchurchGalleryCategoryListResponse(await this.listUseCase.execute(s.id));
  }

  @RestApiPost(OnchurchGalleryCategoryResponse, { path: '/me', description: '카테고리 추가', auth: [USER_TYPE.CLIENT] })
  async createMine(@AuthSignature() s: UserSignature, @Body() req: OnchurchGalleryCategoryWriteRequest) {
    return new OnchurchGalleryCategoryResponse(await this.createUseCase.execute(s.id, req.toCommand()));
  }

  @RestApiPost(OnchurchGalleryCategoryListResponse, { path: '/me/all', description: "'전체' 보기 카테고리 복구/생성", auth: [USER_TYPE.CLIENT] })
  async restoreAllMine(@AuthSignature() s: UserSignature) {
    return new OnchurchGalleryCategoryListResponse(await this.restoreAllUseCase.execute(s.id));
  }

  @RestApiPut(OnchurchGalleryCategoryResponse, { path: '/me/:id', description: '카테고리 수정', auth: [USER_TYPE.CLIENT] })
  async updateMine(@AuthSignature() s: UserSignature, @Param('id', ParseIntPipe) id: number, @Body() req: OnchurchGalleryCategoryWriteRequest) {
    return new OnchurchGalleryCategoryResponse(await this.updateUseCase.execute(s.id, id, req.toCommand()));
  }

  @RestApiDelete(OkResponse, { path: '/me/:id', description: '카테고리 삭제', auth: [USER_TYPE.CLIENT] })
  async deleteMine(@AuthSignature() s: UserSignature, @Param('id', ParseIntPipe) id: number) {
    await this.deleteUseCase.execute(s.id, id);
    return new OkResponse();
  }
}
