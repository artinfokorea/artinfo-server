export class AzeyoSignupCommand {
  nickname: string;
  marriageYear: number;
  children: string;
  snsToken: string;
  snsType: string;
  marketingConsent: boolean;

  constructor(params: { nickname: string; marriageYear: number; children: string; snsToken: string; snsType: string; marketingConsent: boolean }) {
    this.nickname = params.nickname;
    this.marriageYear = params.marriageYear;
    this.children = params.children;
    this.snsToken = params.snsToken;
    this.snsType = params.snsType;
    this.marketingConsent = params.marketingConsent;
  }
}
