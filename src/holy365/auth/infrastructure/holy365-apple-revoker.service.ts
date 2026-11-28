import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as jwt from 'jsonwebtoken';
import { holy365AppleAudiences } from '@/holy365/auth/domain/service/holy365-apple';
import { holy365AppleSiwaKey } from '@/holy365/auth/domain/service/holy365-apple-revoke';

/**
 * 탈퇴할 때 애플 로그인 연결을 끊는다 (App Store 심사 5.1.1(v)) — 앱이 보낸 authorization code 를 refresh token 으로 바꿔 revoke.
 * 키가 없거나 실패해도 탈퇴 자체는 막지 않는다.
 */
@Injectable()
export class Holy365AppleRevoker {
  private readonly logger = new Logger(Holy365AppleRevoker.name);

  async revoke(authorizationCode: string): Promise<boolean> {
    const key = holy365AppleSiwaKey();
    const clientId = holy365AppleAudiences()[0];
    if (!key || !clientId) return false;

    try {
      const now = Math.floor(Date.now() / 1000);
      const clientSecret = jwt.sign({ iss: key.teamId, iat: now, exp: now + 300, aud: 'https://appleid.apple.com', sub: clientId }, key.privateKey, {
        algorithm: 'ES256',
        keyid: key.keyId,
      });
      const form = (data: Record<string, string>) => new URLSearchParams(data).toString();
      const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
      const { data } = await axios.post<{ refresh_token?: string }>(
        'https://appleid.apple.com/auth/token',
        form({ client_id: clientId, client_secret: clientSecret, code: authorizationCode, grant_type: 'authorization_code' }),
        { headers, timeout: 8000 },
      );
      if (!data.refresh_token) return false;
      await axios.post(
        'https://appleid.apple.com/auth/revoke',
        form({ client_id: clientId, client_secret: clientSecret, token: data.refresh_token, token_type_hint: 'refresh_token' }),
        { headers, timeout: 8000 },
      );
      return true;
    } catch (error) {
      this.logger.warn(`apple revoke failed: ${(error as Error).message}`);
      return false;
    }
  }
}
