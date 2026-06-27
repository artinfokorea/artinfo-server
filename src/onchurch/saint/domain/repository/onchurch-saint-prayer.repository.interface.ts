import { OnchurchSaintPrayer } from '@/onchurch/saint/domain/entity/onchurch-saint-prayer.entity';

export const ONCHURCH_SAINT_PRAYER_REPOSITORY = Symbol('ONCHURCH_SAINT_PRAYER_REPOSITORY');

export interface IOnchurchSaintPrayerRepository {
  findBySaintId(churchId: number, saintId: number): Promise<OnchurchSaintPrayer[]>;
  findOwnedById(churchId: number, id: number): Promise<OnchurchSaintPrayer | null>;
  removeBySaintId(churchId: number, saintId: number): Promise<void>;
  create(churchId: number, saintId: number, content: string): Promise<OnchurchSaintPrayer>;
  remove(churchId: number, id: number): Promise<void>;
}
