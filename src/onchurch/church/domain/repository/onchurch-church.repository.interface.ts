import { OnchurchChurch } from '@/onchurch/church/domain/entity/onchurch-church.entity';

export const ONCHURCH_CHURCH_REPOSITORY = Symbol('ONCHURCH_CHURCH_REPOSITORY');

export interface OnchurchChurchUpsertParams {
  slug: string;
  name: string;
  eng: string | null;
  tagline: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  representative: string | null;
  businessNo: string | null;
  logoUrl: string | null;
  enabledPages: string[];
  homeSectionOrder: string[];
}

export interface IOnchurchChurchRepository {
  findByOwnerId(ownerId: number): Promise<OnchurchChurch | null>;
  findBySlug(slug: string): Promise<OnchurchChurch | null>;
  findPublishedBySlug(slug: string): Promise<OnchurchChurch | null>;
  findAllPublished(): Promise<OnchurchChurch[]>;
  findPublishedWithExpiredSubscription(now: Date): Promise<OnchurchChurch[]>;
  bulkUnpublishByOwnerIds(ownerIds: number[]): Promise<number>;
  upsertByOwnerId(ownerId: number, params: OnchurchChurchUpsertParams): Promise<OnchurchChurch>;
  updatePublished(ownerId: number, isPublished: boolean, firstPublishedAt?: Date): Promise<OnchurchChurch>;
}
