import { OnchurchWorshipOrder } from '@/onchurch/worship/domain/entity/onchurch-worship-order.entity';

export const ONCHURCH_WORSHIP_ORDER_REPOSITORY = Symbol('ONCHURCH_WORSHIP_ORDER_REPOSITORY');

export interface OnchurchWorshipOrderWriteParams {
  no: string;
  item: string;
  leader: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface IOnchurchWorshipOrderRepository {
  findAllByChurchId(churchId: number): Promise<OnchurchWorshipOrder[]>;
  findActiveByChurchId(churchId: number): Promise<OnchurchWorshipOrder[]>;
  findOwnedById(churchId: number, id: number): Promise<OnchurchWorshipOrder | null>;
  create(churchId: number, params: OnchurchWorshipOrderWriteParams): Promise<OnchurchWorshipOrder>;
  update(churchId: number, id: number, params: OnchurchWorshipOrderWriteParams): Promise<OnchurchWorshipOrder>;
  remove(churchId: number, id: number): Promise<void>;
}
