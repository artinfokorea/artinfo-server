export const ONCHURCH_REFERRAL_SOURCES = ['naver', 'instagram', 'mail', 'etc'] as const;
export type OnchurchReferralSource = (typeof ONCHURCH_REFERRAL_SOURCES)[number];

export class OnchurchSignupCommand {
  userId: string;
  password: string;
  name: string;
  phone: string;
  marketingConsent: boolean;
  // 성도 가입 시 소속 교회 slug (교회 페이지에서 가입). 없으면 운영자(교회 미소속) 가입.
  churchSlug: string | null;
  // 유입경로 (네이버/인스타그램/메일/기타). 랜딩 가입에서만 수집, 성도 가입은 null.
  referralSource: OnchurchReferralSource | null;
  // 유입경로가 기타(etc)일 때 직접 입력한 내용. 그 외엔 null.
  referralSourceEtc: string | null;

  constructor(params: {
    userId: string;
    password: string;
    name: string;
    phone: string;
    marketingConsent: boolean;
    churchSlug: string | null;
    referralSource: OnchurchReferralSource | null;
    referralSourceEtc: string | null;
  }) {
    this.userId = params.userId;
    this.password = params.password;
    this.name = params.name;
    this.phone = params.phone;
    this.marketingConsent = params.marketingConsent;
    this.churchSlug = params.churchSlug;
    this.referralSource = params.referralSource;
    this.referralSourceEtc = params.referralSourceEtc;
  }
}
