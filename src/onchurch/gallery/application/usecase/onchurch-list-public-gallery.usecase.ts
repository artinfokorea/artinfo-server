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
}

@Injectable()
export class OnchurchListPublicGalleryUseCase {
  constructor(
    @Inject(ONCHURCH_GALLERY_REPOSITORY) private readonly galleryRepo: IOnchurchGalleryRepository,
    @Inject(ONCHURCH_GALLERY_CATEGORY_REPOSITORY) private readonly categoryRepo: IOnchurchGalleryCategoryRepository,
    @Inject(ONCHURCH_CHURCH_REPOSITORY) private readonly churchRepo: IOnchurchChurchRepository,
  ) {}

  async execute(slug: string): Promise<PublicGalleryView> {
    const church = await this.churchRepo.findBySlug(slug);
    if (!church) return { categories: [], galleries: [] };
    const [categories, galleries] = await Promise.all([
      this.categoryRepo.findActiveByChurchId(church.id),
      this.galleryRepo.findActiveByChurchId(church.id),
    ]);
    return { categories, galleries };
  }
}
