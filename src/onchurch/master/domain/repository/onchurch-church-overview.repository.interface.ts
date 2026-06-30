import { PagingItems } from '@/common/type/type';

export const ONCHURCH_CHURCH_OVERVIEW_REPOSITORY = Symbol('ONCHURCH_CHURCH_OVERVIEW_REPOSITORY');

// 교회 1건 + 소유자(owner_id 조인) 정보를 합친 마스터 조회용 행.
export type OnchurchChurchOverviewRow = {
  id: number;
  name: string;
  slug: string;
  address: string | null;
  isPublished: boolean;
  firstPublishedAt: Date | null;
  ownerName: string | null;
  ownerPhone: string | null;
  freeTrialUntil: Date | null;
  paidUntil: Date | null;
  naverVerification: string | null;
};

export interface IOnchurchChurchOverviewRepository {
  findPage(params: {
    keyword: string | null;
    publishedOnly: boolean;
    page: number;
    size: number;
  }): Promise<PagingItems<OnchurchChurchOverviewRow>>;
  findOwnerIdByChurchId(churchId: number): Promise<number | null>;
  // 교회의 네이버 사이트 인증 코드를 갱신한다. 대상 교회가 없으면 false.
  updateNaverVerification(churchId: number, naverVerification: string | null): Promise<boolean>;
}
