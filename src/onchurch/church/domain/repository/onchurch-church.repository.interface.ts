import { OnchurchChurch, OnchurchHomeCustomLink } from '@/onchurch/church/domain/entity/onchurch-church.entity';

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
  youtubeUrl: string | null;
  instagramUrl: string | null;
  liveUrl: string | null;
  isLive: boolean;
  enabledPages: string[];
  homeSectionOrder: string[];
  homeQuickLinks: string[];
  homeCustomLink: OnchurchHomeCustomLink | null;
  siteLang: string;
}

export interface IOnchurchChurchRepository {
  findByOwnerId(ownerId: number): Promise<OnchurchChurch | null>;
  findById(id: number): Promise<OnchurchChurch | null>;
  findBySlug(slug: string): Promise<OnchurchChurch | null>;
  findPublishedBySlug(slug: string): Promise<OnchurchChurch | null>;
  findAllPublished(): Promise<OnchurchChurch[]>;
  findPublishedWithExpiredSubscription(now: Date): Promise<OnchurchChurch[]>;
  bulkUnpublishByOwnerIds(ownerIds: number[]): Promise<number>;
  upsertByOwnerId(ownerId: number, params: OnchurchChurchUpsertParams): Promise<OnchurchChurch>;
  updatePublished(ownerId: number, isPublished: boolean, firstPublishedAt?: Date): Promise<OnchurchChurch>;
  updateSiteTemplate(ownerId: number, siteTemplate: string): Promise<OnchurchChurch>;
  findByReferralCode(referralCode: string): Promise<OnchurchChurch | null>;
  // 교회의 추천 코드를 저장한다(최초 발급). 대상 교회가 없으면 404.
  updateReferralCode(churchId: number, referralCode: string): Promise<OnchurchChurch>;
  // 교회가 입력한 추천인 교회를 기록한다(1회). 대상 교회가 없으면 404.
  updateReferredByChurchId(churchId: number, referredByChurchId: number): Promise<OnchurchChurch>;
  // 이 교회를 추천인으로 입력한 교회 수.
  countReferredByChurchId(churchId: number): Promise<number>;

  updateOwnerId(churchId: number, ownerId: number): Promise<void>;
  updateBannerType(churchId: number, bannerType: string): Promise<void>;
  turnOffLive(churchId: number): Promise<void>;
}
