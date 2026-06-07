import { Inject, Injectable } from '@nestjs/common';
import {
  ONCHURCH_GALLERY_REPOSITORY,
  IOnchurchGalleryRepository,
} from '@/onchurch/gallery/domain/repository/onchurch-gallery.repository.interface';
import {
  ONCHURCH_GALLERY_CATEGORY_REPOSITORY,
  IOnchurchGalleryCategoryRepository,
} from '@/onchurch/gallery/domain/repository/onchurch-gallery-category.repository.interface';
import { ONCHURCH_CHURCH_REPOSITORY, IOnchurchChurchRepository } from '@/onchurch/church/domain/repository/onchurch-church.repository.interface';
import { OnchurchGallery } from '@/onchurch/gallery/domain/entity/onchurch-gallery.entity';
import { OnchurchGalleryCategory } from '@/onchurch/gallery/domain/entity/onchurch-gallery-category.entity';

export interface PublicGalleryView {
  categories: OnchurchGalleryCategory[];
  galleries: OnchurchGallery[];
  totalCount: number;
}

@Injectable()
export class OnchurchListPublicGalleryUseCase {
  constructor(
    @Inject(ONCHURCH_GALLERY_REPOSITORY) private readonly galleryRepo: IOnchurchGalleryRepository,
    @Inject(ONCHURCH_GALLERY_CATEGORY_REPOSITORY) private readonly categoryRepo: IOnchurchGalleryCategoryRepository,
    @Inject(ONCHURCH_CHURCH_REPOSITORY) private readonly churchRepo: IOnchurchChurchRepository,
  ) {}

  async execute(
    slug: string,
    params: { categoryId?: number | null; page: number; size: number },
  ): Promise<PublicGalleryView> {
    const church = await this.churchRepo.findBySlug(slug);
    if (!church) return { categories: [], galleries: [], totalCount: 0 };

    const skip = Math.max(0, (params.page - 1) * params.size);
    const take = Math.min(60, Math.max(1, params.size));

    // 카테고리 칩은 첫 페이지에서만 내려준다 (이후 무한스크롤 요청에는 불필요).
    const categoriesPromise =
      params.page === 1 ? this.categoryRepo.findActiveByChurchId(church.id) : Promise.resolve([]);

    const [categories, paged] = await Promise.all([
      categoriesPromise,
      this.galleryRepo.findActivePagedByChurchId(church.id, {
        categoryId: params.categoryId,
        skip,
        take,
      }),
    ]);

    return { categories, galleries: paged.items, totalCount: paged.totalCount };
  }
}
