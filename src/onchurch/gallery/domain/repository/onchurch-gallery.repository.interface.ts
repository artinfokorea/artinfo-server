import { OnchurchGallery } from '@/onchurch/gallery/domain/entity/onchurch-gallery.entity';

export const ONCHURCH_GALLERY_REPOSITORY = Symbol('ONCHURCH_GALLERY_REPOSITORY');

export interface OnchurchGalleryWriteParams {
  categoryId: number | null;
  title: string;
  date: string | null;
  photoUrl: string | null;
  grad: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface IOnchurchGalleryRepository {
  findAllByChurchId(churchId: number): Promise<OnchurchGallery[]>;
  findActiveByChurchId(churchId: number): Promise<OnchurchGallery[]>;
  findOwnedById(churchId: number, id: number): Promise<OnchurchGallery | null>;
  create(churchId: number, params: OnchurchGalleryWriteParams): Promise<OnchurchGallery>;
  update(churchId: number, id: number, params: OnchurchGalleryWriteParams): Promise<OnchurchGallery>;
  remove(churchId: number, id: number): Promise<void>;
}
