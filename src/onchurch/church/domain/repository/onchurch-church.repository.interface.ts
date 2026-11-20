import { OnchurchChurch, OnchurchHomeCustomLink } from '@/onchurch/church/domain/entity/onchurch-church.entity';
import type { OnchurchSiteDesign } from '@/onchurch/church/application/service/onchurch-site-design';

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

// 교회 이름 검색 결과 한 줄. 담임목사 이름은 교회 소개(onchurch_pastors)에 등록된 값이며 없으면 null.
export interface OnchurchChurchSearchRow {
  church: OnchurchChurch;
  pastorName: string | null;
}

export interface IOnchurchChurchRepository {
  findByOwnerId(ownerId: number): Promise<OnchurchChurch | null>;
  findById(id: number): Promise<OnchurchChurch | null>;
  findBySlug(slug: string): Promise<OnchurchChurch | null>;
  findPublishedBySlug(slug: string): Promise<OnchurchChurch | null>;
  findAllPublished(): Promise<OnchurchChurch[]>;
  // 운영 중인 교회를 이름(부분 일치, 대소문자 무시)으로 찾는다. 담임목사 이름을 함께 준다.
  searchPublishedByName(keyword: string, limit: number): Promise<OnchurchChurchSearchRow[]>;
  // 자체 도메인(custom_domain)이 설정된 교회 전체. 미들웨어의 호스트→교회 매핑에 쓴다.
  // 미공개(is_published=false) 교회도 포함한다 — 라우팅은 되어야 하고, 색인 차단은 robots 단계가 맡는다.
  findAllWithCustomDomain(): Promise<OnchurchChurch[]>;
  findPublishedWithExpiredSubscription(now: Date): Promise<OnchurchChurch[]>;
  bulkUnpublishByOwnerIds(ownerIds: number[]): Promise<number>;
  upsertByOwnerId(ownerId: number, params: OnchurchChurchUpsertParams): Promise<OnchurchChurch>;
  updatePublished(ownerId: number, isPublished: boolean, firstPublishedAt?: Date): Promise<OnchurchChurch>;
  updateSiteTemplate(ownerId: number, siteTemplate: string): Promise<OnchurchChurch>;
  // 공개 홈페이지 디자인 설정(섹션별 디자인 + 색) 저장. null 이면 미설정으로 되돌린다.
  updateSiteDesign(ownerId: number, siteDesign: OnchurchSiteDesign | null): Promise<OnchurchChurch>;
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
