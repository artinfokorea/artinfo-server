import { OnchurchGalleryCategory } from '@/onchurch/gallery/domain/entity/onchurch-gallery-category.entity';

export const ONCHURCH_GALLERY_CATEGORY_REPOSITORY = Symbol('ONCHURCH_GALLERY_CATEGORY_REPOSITORY');

export interface OnchurchGalleryCategoryWriteParams {
  name: string;
  sortOrder: number;
  isActive: boolean;
}

export interface IOnchurchGalleryCategoryRepository {
  /** 교회에 '전체' 보기 카테고리가 한 번도 없었다면 자동 생성한다(삭제된 적 있으면 재생성하지 않음). */
  ensureAllCategory(churchId: number): Promise<void>;
  /** '전체' 보기 카테고리를 명시적으로 복구/생성한다(삭제했던 것을 되살리거나 없으면 새로 만든다). */
  restoreAllCategory(churchId: number): Promise<void>;
  findAllByChurchId(churchId: number): Promise<OnchurchGalleryCategory[]>;
  findActiveByChurchId(churchId: number): Promise<OnchurchGalleryCategory[]>;
  findOwnedById(churchId: number, id: number): Promise<OnchurchGalleryCategory | null>;
  create(churchId: number, params: OnchurchGalleryCategoryWriteParams): Promise<OnchurchGalleryCategory>;
  update(churchId: number, id: number, params: OnchurchGalleryCategoryWriteParams): Promise<OnchurchGalleryCategory>;
  remove(churchId: number, id: number): Promise<void>;
}
