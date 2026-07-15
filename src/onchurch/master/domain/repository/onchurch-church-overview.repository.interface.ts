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
  // 공개 홈페이지 템플릿 ID. 미지정 시 'default'.
  siteTemplate: string;
  // 소유자가 테스트 계정인지 여부(owner.is_test). 달력 등에서 제외 판단에 사용.
  isTest: boolean;
  // 소유자의 마지막 세션 갱신 시각(onchurch_auths.updated_at 최대값) = 마지막 접속 근사치. 접속 이력 없으면 null.
  lastActivity: Date | null;
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
  // 교회의 공개 홈페이지 템플릿을 갱신한다. 대상 교회가 없으면 false.
  updateSiteTemplate(churchId: number, siteTemplate: string): Promise<boolean>;
  // 교회의 운영 여부(is_published)를 갱신한다. 대상 교회가 없으면 false.
  updatePublished(churchId: number, isPublished: boolean): Promise<boolean>;
}
