import { OnchurchTransportation } from '@/onchurch/transportation/domain/entity/onchurch-transportation.entity';

export const ONCHURCH_TRANSPORTATION_REPOSITORY = Symbol('ONCHURCH_TRANSPORTATION_REPOSITORY');

export interface OnchurchTransportationWriteParams {
  icon: string | null;
  tag: string;
  title: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface IOnchurchTransportationRepository {
  findActiveByChurchId(churchId: number): Promise<OnchurchTransportation[]>;
  findAllByChurchId(churchId: number): Promise<OnchurchTransportation[]>;
  findOwnedById(churchId: number, id: number): Promise<OnchurchTransportation | null>;
  create(churchId: number, params: OnchurchTransportationWriteParams): Promise<OnchurchTransportation>;
  update(churchId: number, id: number, params: OnchurchTransportationWriteParams): Promise<OnchurchTransportation>;
  remove(churchId: number, id: number): Promise<void>;
}
