export class OnchurchLoginCommand {
  userId: string;
  password: string;
  // 교회 사이트에서 로그인하는 경우 해당 교회 slug (성도는 자기 교회에서만 로그인 가능)
  churchSlug: string | null;

  constructor(params: { userId: string; password: string; churchSlug: string | null }) {
    this.userId = params.userId;
    this.password = params.password;
    this.churchSlug = params.churchSlug;
  }
}
