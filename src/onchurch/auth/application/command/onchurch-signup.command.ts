export class OnchurchSignupCommand {
  userId: string;
  password: string;
  name: string;
  phone: string;
  marketingConsent: boolean;

  constructor(params: { userId: string; password: string; name: string; phone: string; marketingConsent: boolean }) {
    this.userId = params.userId;
    this.password = params.password;
    this.name = params.name;
    this.phone = params.phone;
    this.marketingConsent = params.marketingConsent;
  }
}
