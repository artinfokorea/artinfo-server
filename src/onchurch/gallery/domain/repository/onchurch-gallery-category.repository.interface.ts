import { OnchurchGalleryCategory } from '@/onchurch/gallery/domain/entity/onchurch-gallery-category.entity';

export const ONCHURCH_GALLERY_CATEGORY_REPOSITORY = Symbol('ONCHURCH_GALLERY_CATEGORY_REPOSITORY');

export interface OnchurchGalleryCategoryWriteParams {
  name: string;
  sortOrder: number;
  isActive: boolean;
}

export interface IOnchurchGalleryCategoryRepository {
  findAllByChurchId(churchId: number): Promise<OnchurchGalleryCategory[]>;
  findActiveByChurchId(churchId: number): Promise<OnchurchGalleryCategory[]>;
  findOwnedById(churchId: number, id: number): Promise<OnchurchGalleryCategory | null>;
  create(churchId: number, params: OnchurchGalleryCategoryWriteParams): Promise<OnchurchGalleryCategory>;
  update(churchId: number, id: number, params: OnchurchGalleryCategoryWriteParams): Promise<OnchurchGalleryCategory>;
  remove(churchId: number, id: number): Promise<void>;
}
