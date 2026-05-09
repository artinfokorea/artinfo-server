import { OnchurchWorshipService, OnchurchWorshipServiceTag } from '@/onchurch/worship/domain/entity/onchurch-worship-service.entity';

export const ONCHURCH_WORSHIP_SERVICE_REPOSITORY = Symbol('ONCHURCH_WORSHIP_SERVICE_REPOSITORY');

export interface OnchurchWorshipServiceWriteParams {
  tag: OnchurchWorshipServiceTag;
  name: string;
  time: string;
  meta: string | null;
  isFeatured: boolean;
  sortOrder: number;
  isActive: boolean;
}

export interface IOnchurchWorshipServiceRepository {
  findAllByChurchId(churchId: number): Promise<OnchurchWorshipService[]>;
  findActiveByChurchId(churchId: number): Promise<OnchurchWorshipService[]>;
  findOwnedById(churchId: number, id: number): Promise<OnchurchWorshipService | null>;
  create(churchId: number, params: OnchurchWorshipServiceWriteParams): Promise<OnchurchWorshipService>;
  update(churchId: number, id: number, params: OnchurchWorshipServiceWriteParams): Promise<OnchurchWorshipService>;
  remove(churchId: number, id: number): Promise<void>;
}
