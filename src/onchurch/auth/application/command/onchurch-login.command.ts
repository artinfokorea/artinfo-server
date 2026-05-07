export class OnchurchLoginCommand {
  userId: string;
  password: string;

  constructor(params: { userId: string; password: string }) {
    this.userId = params.userId;
    this.password = params.password;
  }
}
