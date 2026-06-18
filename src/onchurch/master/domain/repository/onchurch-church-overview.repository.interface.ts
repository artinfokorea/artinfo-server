import { PagingItems } from '@/common/type/type';

export const ONCHURCH_CHURCH_OVERVIEW_REPOSITORY = Symbol('ONCHURCH_CHURCH_OVERVIEW_REPOSITORY');

// 교회 1건 + 소유자(owner_id 조인) 정보를 합친 마스터 조회용 행.
export type OnchurchChurchOverviewRow = {
  id: number;
  name: string;
  slug: string;
  isPublished: boolean;
  firstPublishedAt: Date | null;
  ownerName: string | null;
  ownerPhone: string | null;
  freeTrialUntil: Date | null;
  paidUntil: Date | null;
};

export interface IOnchurchChurchOverviewRepository {
  findPage(params: {
    keyword: string | null;
    publishedOnly: boolean;
    page: number;
    size: number;
  }): Promise<PagingItems<OnchurchChurchOverviewRow>>;
}
