export class OnchurchSignupCommand {
  userId: string;
  password: string;
  name: string;
  phone: string;
  marketingConsent: boolean;
  // 성도 가입 시 소속 교회 slug (교회 페이지에서 가입). 없으면 운영자(교회 미소속) 가입.
  churchSlug: string | null;

  constructor(params: { userId: string; password: string; name: string; phone: string; marketingConsent: boolean; churchSlug: string | null }) {
    this.userId = params.userId;
    this.password = params.password;
    this.name = params.name;
    this.phone = params.phone;
    this.marketingConsent = params.marketingConsent;
    this.churchSlug = params.churchSlug;
  }
}
