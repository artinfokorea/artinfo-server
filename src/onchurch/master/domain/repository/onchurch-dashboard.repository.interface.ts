export const ONCHURCH_DASHBOARD_REPOSITORY = Symbol('ONCHURCH_DASHBOARD_REPOSITORY');

// 해당 월에 랜딩 페이지로 가입한 유저(운영자 트랙: role admin/owner) 코호트의 퍼널.
export type OnchurchSignupFunnel = {
  signups: number; // 가입 수
  createdChurch: number; // 그 중 교회를 만든 수(교회 소유)
  paid: number; // 그 중 결제한 수(paid_until 존재)
};

// 해당 월에 교회가 유입된 날짜별 건수(결제 교회 = owner.paid_until 존재).
export type OnchurchPaidChurchInflowDay = {
  date: string; // YYYY-MM-DD (KST)
  count: number;
};

export interface IOnchurchDashboardRepository {
  signupFunnel(params: { month: string }): Promise<OnchurchSignupFunnel>;
  paidChurchInflowByDay(params: { month: string }): Promise<OnchurchPaidChurchInflowDay[]>;
}
