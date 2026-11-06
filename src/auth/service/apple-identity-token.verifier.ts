import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { createPublicKey, JsonWebKey } from 'crypto';
import * as jwt from 'jsonwebtoken';
import { AppleIdentityTokenIsNotValid } from '@/auth/exception/auth.exception';

export interface AppleIdentity {
  /** Apple 이 사용자마다 고정으로 주는 식별자 */
  sub: string;
  /** "Hide My Email" 을 고르면 privaterelay.appleid.com 릴레이 주소가 온다 */
  email: string | null;
}

interface AppleJwk {
  kty: string;
  kid: string;
  use: string;
  alg: string;
  n: string;
  e: string;
}

const APPLE_ISSUER = 'https://appleid.apple.com';
const APPLE_JWKS_URL = 'https://appleid.apple.com/auth/keys';
const DEFAULT_CLIENT_IDS = ['com.artinfokorea.app'];
const JWKS_CACHE_MS = 60 * 60 * 1000;

/**
 * Apple 로그인 — 앱이 넘긴 identity token(JWT) 을 Apple 공개키(JWKS) 로 직접 검증한다.
 * (온기의 OngiSnsClientService.getAppleUserInfo 와 같은 방식)
 *
 * - aud 는 앱 번들 ID. 웹용 Services ID 를 추가하려면 APPLE_CLIENT_IDS 에 쉼표로 나열한다.
 * - 이름은 토큰에 없고 최초 로그인 1회만 앱에 내려오므로 요청의 name 으로 받는다 (AuthService 에서 처리).
 */
@Injectable()
export class AppleIdentityTokenVerifier {
  private keysCache: { keys: AppleJwk[]; fetchedAt: number } | null = null;

  async verify(identityToken: string): Promise<AppleIdentity> {
    try {
      const decoded = jwt.decode(identityToken, { complete: true });
      const kid = decoded?.header?.kid;
      if (!kid) throw new AppleIdentityTokenIsNotValid();

      const publicKey = await this.getPublicKey(kid);
      const payload = jwt.verify(identityToken, publicKey, {
        algorithms: ['RS256'],
        issuer: APPLE_ISSUER,
        audience: this.allowedClientIds(),
      }) as jwt.JwtPayload;

      if (!payload.sub) throw new AppleIdentityTokenIsNotValid();

      return {
        sub: payload.sub,
        email: typeof payload['email'] === 'string' ? payload['email'] : null,
      };
    } catch {
      throw new AppleIdentityTokenIsNotValid();
    }
  }

  private allowedClientIds(): string[] {
    const configured = (process.env['APPLE_CLIENT_IDS'] || '')
      .split(',')
      .map(id => id.trim())
      .filter(Boolean);
    return configured.length > 0 ? configured : DEFAULT_CLIENT_IDS;
  }

  /** Apple JWKS 는 드물게 회전되므로 1시간 캐시, 모르는 kid 가 오면 즉시 재조회 */
  private async getPublicKey(kid: string): Promise<string> {
    const findKey = () => this.keysCache?.keys.find(key => key.kid === kid);

    const isFresh = this.keysCache && Date.now() - this.keysCache.fetchedAt < JWKS_CACHE_MS;
    let key = isFresh ? findKey() : undefined;
    if (!key) {
      const res = await axios.get<{ keys: AppleJwk[] }>(APPLE_JWKS_URL, { timeout: 5000 });
      this.keysCache = { keys: res.data.keys, fetchedAt: Date.now() };
      key = findKey();
    }
    if (!key) throw new AppleIdentityTokenIsNotValid();

    return createPublicKey({ key: key as unknown as JsonWebKey, format: 'jwk' })
      .export({ type: 'spki', format: 'pem' })
      .toString();
  }
}
