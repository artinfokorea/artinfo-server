import { OnchurchGallery } from '@/onchurch/gallery/domain/entity/onchurch-gallery.entity';

export const ONCHURCH_GALLERY_REPOSITORY = Symbol('ONCHURCH_GALLERY_REPOSITORY');

export interface OnchurchGalleryWriteParams {
  categoryId: number | null;
  batchId: string | null;
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
  findActivePagedByChurchId(
    churchId: number,
    params: { categoryId?: number | null; skip: number; take: number },
  ): Promise<{ items: OnchurchGallery[]; totalCount: number }>;
  findOwnedById(churchId: number, id: number): Promise<OnchurchGallery | null>;
  create(churchId: number, params: OnchurchGalleryWriteParams): Promise<OnchurchGallery>;
  update(churchId: number, id: number, params: OnchurchGalleryWriteParams): Promise<OnchurchGallery>;
  remove(churchId: number, id: number): Promise<void>;
}
