import { OnchurchSermon } from '@/onchurch/sermon/domain/entity/onchurch-sermon.entity';

export const ONCHURCH_SERMON_REPOSITORY = Symbol('ONCHURCH_SERMON_REPOSITORY');

export interface OnchurchSermonWriteParams {
  seriesId: number | null;
  title: string;
  pastor: string | null;
  date: string | null;
  duration: string | null;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  bulletinUrl: string | null;
  summary: string | null;
  isFeatured: boolean;
  sortOrder: number;
  isActive: boolean;
}

export interface IOnchurchSermonRepository {
  findAllByChurchId(churchId: number): Promise<OnchurchSermon[]>;
  findActiveByChurchId(churchId: number): Promise<OnchurchSermon[]>;
  findOwnedById(churchId: number, id: number): Promise<OnchurchSermon | null>;
  create(churchId: number, params: OnchurchSermonWriteParams): Promise<OnchurchSermon>;
  update(churchId: number, id: number, params: OnchurchSermonWriteParams): Promise<OnchurchSermon>;
  remove(churchId: number, id: number): Promise<void>;
}
