import axios from 'axios';
import { createPublicKey, JsonWebKey } from 'crypto';
import * as jwt from 'jsonwebtoken';

const KEYS_TTL_MS = 60 * 60 * 1000;

/** 공개키 목록(JWKS)으로 RS256 토큰 서명을 검증한다 — 애플·구글 로그인 토큰 공용. 키는 1시간 캐시, 모르는 kid 면 다시 받는다 */
export class Holy365JwksVerifier {
  private keys: { at: number; byKid: Map<string, JsonWebKey> } | null = null;

  constructor(private readonly url: string) {}

  private async key(kid: string): Promise<JsonWebKey | undefined> {
    if (!this.keys || Date.now() - this.keys.at > KEYS_TTL_MS || !this.keys.byKid.has(kid)) {
      const { data } = await axios.get<{ keys: (JsonWebKey & { kid: string })[] }>(this.url, { timeout: 8000 });
      this.keys = { at: Date.now(), byKid: new Map(data.keys.map(k => [k.kid, k])) };
    }
    return this.keys.byKid.get(kid);
  }

  /** 서명이 맞으면 payload, 아니면 null (발급자·대상·만료 같은 내용 확인은 호출한 쪽에서) */
  async verify<T>(token: string): Promise<T | null> {
    const decoded = jwt.decode(token, { complete: true });
    const kid = decoded && typeof decoded === 'object' ? decoded.header.kid : undefined;
    if (!kid) return null;
    const jwk = await this.key(kid);
    if (!jwk) return null;
    try {
      const pem = createPublicKey({ key: jwk, format: 'jwk' }).export({ type: 'spki', format: 'pem' });
      return jwt.verify(token, pem, { algorithms: ['RS256'], ignoreExpiration: true }) as T;
    } catch {
      return null;
    }
  }
}
