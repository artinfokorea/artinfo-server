import { OnchurchHistory } from '@/onchurch/about/domain/entity/onchurch-history.entity';

export const ONCHURCH_HISTORY_REPOSITORY = Symbol('ONCHURCH_HISTORY_REPOSITORY');

export interface OnchurchHistoryWriteParams {
  year: string;
  title: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface IOnchurchHistoryRepository {
  findAllByChurchId(churchId: number): Promise<OnchurchHistory[]>;
  findActiveByChurchId(churchId: number): Promise<OnchurchHistory[]>;
  findOwnedById(churchId: number, id: number): Promise<OnchurchHistory | null>;
  create(churchId: number, params: OnchurchHistoryWriteParams): Promise<OnchurchHistory>;
  update(churchId: number, id: number, params: OnchurchHistoryWriteParams): Promise<OnchurchHistory>;
  remove(churchId: number, id: number): Promise<void>;
}
