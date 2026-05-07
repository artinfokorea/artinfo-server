import { OnchurchBanner } from '@/onchurch/banner/domain/entity/onchurch-banner.entity';

export const ONCHURCH_BANNER_REPOSITORY = Symbol('ONCHURCH_BANNER_REPOSITORY');

export interface OnchurchBannerWriteParams {
  title: string;
  description: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface IOnchurchBannerRepository {
  findActiveByChurchId(churchId: number): Promise<OnchurchBanner[]>;
  findAllByChurchId(churchId: number): Promise<OnchurchBanner[]>;
  findOwnedById(churchId: number, id: number): Promise<OnchurchBanner | null>;
  create(churchId: number, params: OnchurchBannerWriteParams): Promise<OnchurchBanner>;
  update(churchId: number, id: number, params: OnchurchBannerWriteParams): Promise<OnchurchBanner>;
  remove(churchId: number, id: number): Promise<void>;
}
