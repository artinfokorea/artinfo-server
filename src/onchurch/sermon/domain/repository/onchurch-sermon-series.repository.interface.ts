import { OnchurchSermonSeries } from '@/onchurch/sermon/domain/entity/onchurch-sermon-series.entity';

export const ONCHURCH_SERMON_SERIES_REPOSITORY = Symbol('ONCHURCH_SERMON_SERIES_REPOSITORY');

export interface OnchurchSermonSeriesWriteParams {
  name: string;
  sortOrder: number;
  isActive: boolean;
}

export interface IOnchurchSermonSeriesRepository {
  ensureAllCategory(churchId: number): Promise<void>;
  restoreAllCategory(churchId: number): Promise<void>;
  findAllByChurchId(churchId: number): Promise<OnchurchSermonSeries[]>;
  findActiveByChurchId(churchId: number): Promise<OnchurchSermonSeries[]>;
  findOwnedById(churchId: number, id: number): Promise<OnchurchSermonSeries | null>;
  create(churchId: number, params: OnchurchSermonSeriesWriteParams): Promise<OnchurchSermonSeries>;
  update(churchId: number, id: number, params: OnchurchSermonSeriesWriteParams): Promise<OnchurchSermonSeries>;
  remove(churchId: number, id: number): Promise<void>;
}
