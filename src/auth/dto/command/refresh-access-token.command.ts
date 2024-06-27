export class RefreshAccessTokenCommand {
  accessToken: string;
  refreshToken: string;

  constructor({ accessToken, refreshToken }: { accessToken: string; refreshToken: string }) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }
}
