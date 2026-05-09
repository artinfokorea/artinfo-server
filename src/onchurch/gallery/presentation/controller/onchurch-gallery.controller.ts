import { Body, Param, ParseIntPipe } from '@nestjs/common';
import { RestApiController, RestApiDelete, RestApiGet, RestApiPost, RestApiPut } from '@/common/decorator/rest-api';
import { AuthSignature } from '@/common/decorator/AuthSignature';
import { UserSignature } from '@/common/type/type';
import { USER_TYPE } from '@/user/entity/user.entity';
import { OkResponse } from '@/common/response/ok.response';
import {
  OnchurchListMyGalleriesUseCase,
  OnchurchCreateMyGalleryUseCase,
  OnchurchUpdateMyGalleryUseCase,
  OnchurchDeleteMyGalleryUseCase,
} from '@/onchurch/gallery/application/usecase/onchurch-gallery.usecase';
import { OnchurchGalleryWriteRequest } from '@/onchurch/gallery/presentation/dto/request/onchurch-gallery-write.request';
import { OnchurchGalleryListResponse, OnchurchGalleryResponse } from '@/onchurch/gallery/presentation/dto/response/onchurch-gallery.response';

@RestApiController('/onchurch/galleries', 'Onchurch Gallery')
export class OnchurchGalleryController {
  constructor(
    private readonly listUseCase: OnchurchListMyGalleriesUseCase,
    private readonly createUseCase: OnchurchCreateMyGalleryUseCase,
    private readonly updateUseCase: OnchurchUpdateMyGalleryUseCase,
    private readonly deleteUseCase: OnchurchDeleteMyGalleryUseCase,
  ) {}

  @RestApiGet(OnchurchGalleryListResponse, { path: '/me', description: '내 교회 갤러리 목록', auth: [USER_TYPE.CLIENT] })
  async listMine(@AuthSignature() s: UserSignature) {
    return new OnchurchGalleryListResponse(await this.listUseCase.execute(s.id));
  }

  @RestApiPost(OnchurchGalleryResponse, { path: '/me', description: '갤러리 추가', auth: [USER_TYPE.CLIENT] })
  async createMine(@AuthSignature() s: UserSignature, @Body() req: OnchurchGalleryWriteRequest) {
    return new OnchurchGalleryResponse(await this.createUseCase.execute(s.id, req.toCommand()));
  }

  @RestApiPut(OnchurchGalleryResponse, { path: '/me/:id', description: '갤러리 수정', auth: [USER_TYPE.CLIENT] })
  async updateMine(@AuthSignature() s: UserSignature, @Param('id', ParseIntPipe) id: number, @Body() req: OnchurchGalleryWriteRequest) {
    return new OnchurchGalleryResponse(await this.updateUseCase.execute(s.id, id, req.toCommand()));
  }

  @RestApiDelete(OkResponse, { path: '/me/:id', description: '갤러리 삭제', auth: [USER_TYPE.CLIENT] })
  async deleteMine(@AuthSignature() s: UserSignature, @Param('id', ParseIntPipe) id: number) {
    await this.deleteUseCase.execute(s.id, id);
    return new OkResponse();
  }
}
