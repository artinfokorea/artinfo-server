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

export interface PublicGalleryPhoto {
  id: number;
  photoUrl: string | null;
  grad: string | null;
  title: string;
  date: string | null;
}

// 공개 갤러리 1장(카드) = batch_id로 묶인 사진 묶음(앨범). batch_id가 없는 사진은 1장짜리 묶음으로 취급한다.
export interface PublicGalleryGroup {
  groupKey: string;
  categoryId: number | null;
  title: string;
  date: string | null;
  coverUrl: string | null;
  grad: string | null;
  count: number;
  photos: PublicGalleryPhoto[];
}

export interface PublicGalleryView {
  categories: OnchurchGalleryCategory[];
  groups: PublicGalleryGroup[];
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
    if (!church) return { categories: [], groups: [], totalCount: 0 };

    const skip = Math.max(0, (params.page - 1) * params.size);
    const take = Math.min(60, Math.max(1, params.size));

    // 카테고리 칩은 첫 페이지에서만 내려준다 (이후 무한스크롤 요청에는 불필요).
    const categoriesPromise =
      params.page === 1 ? this.categoryRepo.findActiveByChurchId(church.id) : Promise.resolve([]);

    // 한 교회의 갤러리는 규모가 작아 전체를 가져와 메모리에서 묶고 페이징한다(페이지 경계에서 묶음이 갈리지 않게).
    const [categories, allPhotos] = await Promise.all([
      categoriesPromise,
      this.galleryRepo.findActiveByChurchId(church.id),
    ]);

    const filtered =
      params.categoryId != null
        ? allPhotos.filter((p) => p.categoryId === params.categoryId)
        : allPhotos;

    const groups = this.groupPhotos(filtered);
    const totalCount = groups.length;
    const paged = groups.slice(skip, skip + take);

    return { categories, groups: paged, totalCount };
  }

  // 입력은 createdAt DESC, id DESC 정렬이라, 묶음이 처음 등장하는 순서 = 최신 사진 기준 내림차순이 된다.
  private groupPhotos(photos: OnchurchGallery[]): PublicGalleryGroup[] {
    const map = new Map<string, OnchurchGallery[]>();
    for (const p of photos) {
      const bid = (p.batchId ?? '').trim();
      const key = bid ? `batch-${bid}` : `single-${p.id}`;
      const arr = map.get(key);
      if (arr) arr.push(p);
      else map.set(key, [p]);
    }

    const groups: PublicGalleryGroup[] = [];
    for (const [key, raw] of map) {
      // 묶음 내부는 sort_order, id 오름차순으로 정렬해 커버/넘김 순서를 고정한다.
      const sorted = [...raw].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
      const cover = sorted[0];
      groups.push({
        groupKey: key,
        categoryId: cover.categoryId,
        title: cover.title,
        date: cover.date,
        coverUrl: cover.photoUrl,
        grad: cover.grad,
        count: sorted.length,
        photos: sorted.map((p) => ({
          id: p.id,
          photoUrl: p.photoUrl,
          grad: p.grad,
          title: p.title,
          date: p.date,
        })),
      });
    }
    return groups;
  }
}
