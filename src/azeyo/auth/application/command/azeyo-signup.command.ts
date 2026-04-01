export class AzeyoSignupCommand {
  nickname: string;
  marriageYear: number;
  children: string;
  snsToken: string;
  snsType: string;

  constructor(params: { nickname: string; marriageYear: number; children: string; snsToken: string; snsType: string }) {
    this.nickname = params.nickname;
    this.marriageYear = params.marriageYear;
    this.children = params.children;
    this.snsToken = params.snsToken;
    this.snsType = params.snsType;
  }
}
