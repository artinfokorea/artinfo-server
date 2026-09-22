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
  // 담임목사 이름(onchurch_pastors.name). 미등록이면 null.
  pastorName: string | null;
  freeTrialUntil: Date | null;
  paidUntil: Date | null;
  naverVerification: string | null;
  // 공개 홈페이지 템플릿 ID. 미지정 시 'default'.
  siteTemplate: string;
  // 추천인 이벤트: 이 교회 자기 코드(미발급이면 null).
  referralCode: string | null;
  // 이 교회가 입력한 추천인 교회 이름(미입력이면 null).
  referredByChurchName: string | null;
  // 이 교회 코드를 입력하고 가입한 교회 수.
  referredCount: number;
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
  // 가계부 메모에 쓸 교회 이름. 대상 교회가 없으면 null.
  findNameById(churchId: number): Promise<string | null>;
  // 교회의 네이버 사이트 인증 코드를 갱신한다. 대상 교회가 없으면 false.
  updateNaverVerification(churchId: number, naverVerification: string | null): Promise<boolean>;
  // 교회의 공개 홈페이지 템플릿을 갱신한다. 대상 교회가 없으면 false.
  updateSiteTemplate(churchId: number, siteTemplate: string): Promise<boolean>;
  // 교회의 운영 여부(is_published)를 갱신한다. 대상 교회가 없으면 false.
  updatePublished(churchId: number, isPublished: boolean): Promise<boolean>;
}
