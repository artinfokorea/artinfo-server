import { OnchurchPrayerRequest, OnchurchPrayerStatus } from '@/onchurch/prayer/domain/entity/onchurch-prayer-request.entity';

export const ONCHURCH_PRAYER_REPOSITORY = Symbol('ONCHURCH_PRAYER_REPOSITORY');

export interface OnchurchPrayerCreateParams {
  name: string | null;
  contact: string | null;
  category: string;
  scope: string;
  content: string;
  isAnonymous: boolean;
}

export interface IOnchurchPrayerRepository {
  create(churchId: number, params: OnchurchPrayerCreateParams): Promise<OnchurchPrayerRequest>;
  findAllByChurchId(churchId: number): Promise<OnchurchPrayerRequest[]>;
  findOwnedById(churchId: number, id: number): Promise<OnchurchPrayerRequest | null>;
  updateStatus(churchId: number, id: number, status: OnchurchPrayerStatus): Promise<OnchurchPrayerRequest>;
  remove(churchId: number, id: number): Promise<void>;
}
