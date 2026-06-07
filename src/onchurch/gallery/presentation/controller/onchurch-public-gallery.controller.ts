import { Param, Query } from '@nestjs/common';
import { RestApiController, RestApiGet } from '@/common/decorator/rest-api';
import { OnchurchListPublicGalleryUseCase } from '@/onchurch/gallery/application/usecase/onchurch-list-public-gallery.usecase';
import { OnchurchPublicGalleryResponse } from '@/onchurch/gallery/presentation/dto/response/onchurch-gallery.response';

@RestApiController('/onchurch/sites', 'Onchurch Public Site')
export class OnchurchPublicGalleryController {
  constructor(private readonly listPublicUseCase: OnchurchListPublicGalleryUseCase) {}

  @RestApiGet(OnchurchPublicGalleryResponse, { path: '/:slug/galleries', description: '공개 - 교회 갤러리 (카테고리 + 사진, 페이징)' })
  async listPublic(
    @Param('slug') slug: string,
    @Query('categoryId') categoryIdRaw?: string,
    @Query('page') pageRaw?: string,
    @Query('size') sizeRaw?: string,
  ) {
    const page = Math.max(1, parseInt(pageRaw ?? '1', 10) || 1);
    const size = Math.max(1, Math.min(60, parseInt(sizeRaw ?? '12', 10) || 12));
    const parsedCategoryId = parseInt(categoryIdRaw ?? '', 10);
    const categoryId = Number.isFinite(parsedCategoryId) ? parsedCategoryId : null;
    const view = await this.listPublicUseCase.execute(slug, { categoryId, page, size });
    return new OnchurchPublicGalleryResponse(view);
  }
}
