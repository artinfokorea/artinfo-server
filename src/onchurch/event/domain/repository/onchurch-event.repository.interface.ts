import { OnchurchEvent } from '@/onchurch/event/domain/entity/onchurch-event.entity';

export const ONCHURCH_EVENT_REPOSITORY = Symbol('ONCHURCH_EVENT_REPOSITORY');

export interface OnchurchEventWriteParams {
  title: string;
  description: string | null;
  location: string | null;
  startAt: Date;
  endAt: Date | null;
  isAllDay: boolean;
  isActive: boolean;
}

export interface IOnchurchEventRepository {
  findAllByChurchId(churchId: number): Promise<OnchurchEvent[]>;
  findActiveByChurchIdInRange(churchId: number, from: Date | null, to: Date | null): Promise<OnchurchEvent[]>;
  findOwnedById(churchId: number, id: number): Promise<OnchurchEvent | null>;
  create(churchId: number, params: OnchurchEventWriteParams): Promise<OnchurchEvent>;
  update(churchId: number, id: number, params: OnchurchEventWriteParams): Promise<OnchurchEvent>;
  remove(churchId: number, id: number): Promise<void>;
}
