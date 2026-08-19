import { Param, Query } from '@nestjs/common';
import { RestApiController, RestApiGet } from '@/common/decorator/rest-api';
import { Signature } from '@/common/decorator/Signature';
import { UserSignature } from '@/common/type/type';
import { OnchurchListPublicGalleryUseCase } from '@/onchurch/gallery/application/usecase/onchurch-list-public-gallery.usecase';
import { OnchurchPublicGalleryResponse } from '@/onchurch/gallery/presentation/dto/response/onchurch-gallery.response';

@RestApiController('/onchurch/sites', 'Onchurch Public Site')
export class OnchurchPublicGalleryController {
  constructor(private readonly listPublicUseCase: OnchurchListPublicGalleryUseCase) {}

  @RestApiGet(OnchurchPublicGalleryResponse, { path: '/:slug/galleries', description: '공개 - 교회 갤러리 (카테고리 + 사진, 페이징)' })
  async listPublic(
    @Param('slug') slug: string,
    @Signature() signature: UserSignature | null,
    @Query('categoryId') categoryIdRaw?: string,
    @Query('page') pageRaw?: string,
    @Query('size') sizeRaw?: string,
  ) {
    const page = Math.max(1, parseInt(pageRaw ?? '1', 10) || 1);
    const size = Math.max(1, Math.min(60, parseInt(sizeRaw ?? '12', 10) || 12));
    const parsedCategoryId = parseInt(categoryIdRaw ?? '', 10);
    const categoryId = Number.isFinite(parsedCategoryId) ? parsedCategoryId : null;
    const view = await this.listPublicUseCase.execute(slug, { categoryId, page, size, viewerUserId: signature?.id ?? null });
    return new OnchurchPublicGalleryResponse(view);
  }
}
