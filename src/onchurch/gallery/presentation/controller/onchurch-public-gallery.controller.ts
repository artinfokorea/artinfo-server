import { Param } from '@nestjs/common';
import { RestApiController, RestApiGet } from '@/common/decorator/rest-api';
import { OnchurchListPublicGalleryUseCase } from '@/onchurch/gallery/application/usecase/onchurch-list-public-gallery.usecase';
import { OnchurchPublicGalleryResponse } from '@/onchurch/gallery/presentation/dto/response/onchurch-gallery.response';

@RestApiController('/onchurch/sites', 'Onchurch Public Site')
export class OnchurchPublicGalleryController {
  constructor(private readonly listPublicUseCase: OnchurchListPublicGalleryUseCase) {}

  @RestApiGet(OnchurchPublicGalleryResponse, { path: '/:slug/galleries', description: '공개 - 교회 갤러리 (카테고리 + 사진)' })
  async listPublic(@Param('slug') slug: string) {
    const view = await this.listPublicUseCase.execute(slug);
    return new OnchurchPublicGalleryResponse(view);
  }
}
