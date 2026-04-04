export class AzeyoSignupCommand {
  nickname: string;
  marriageDate: string | null;
  children: string;
  snsToken: string;
  snsType: string;
  marketingConsent: boolean;

  constructor(params: { nickname: string; marriageDate: string | null; children: string; snsToken: string; snsType: string; marketingConsent: boolean }) {
    this.nickname = params.nickname;
    this.marriageDate = params.marriageDate;
    this.children = params.children;
    this.snsToken = params.snsToken;
    this.snsType = params.snsType;
    this.marketingConsent = params.marketingConsent;
  }
}
