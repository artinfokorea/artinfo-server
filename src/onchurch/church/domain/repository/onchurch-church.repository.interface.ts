import { OnchurchChurch } from '@/onchurch/church/domain/entity/onchurch-church.entity';

export const ONCHURCH_CHURCH_REPOSITORY = Symbol('ONCHURCH_CHURCH_REPOSITORY');

export interface OnchurchChurchUpsertParams {
  slug: string;
  name: string;
  eng: string | null;
  tagline: string | null;
  phone: string;
  email: string;
  address: string;
  representative: string | null;
  businessNo: string | null;
  logoUrl: string | null;
  enabledPages: string[];
}

export interface IOnchurchChurchRepository {
  findByOwnerId(ownerId: number): Promise<OnchurchChurch | null>;
  findBySlug(slug: string): Promise<OnchurchChurch | null>;
  upsertByOwnerId(ownerId: number, params: OnchurchChurchUpsertParams): Promise<OnchurchChurch>;
}
