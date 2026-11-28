import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { createPublicKey, JsonWebKey } from 'crypto';
import * as jwt from 'jsonwebtoken';
import { appleClaimsError, Holy365AppleClaims, holy365AppleAudiences } from '@/holy365/auth/domain/service/holy365-apple';

const KEYS_URL = 'https://appleid.apple.com/auth/keys';
const KEYS_TTL_MS = 60 * 60 * 1000;

/** iOS 앱의 "Sign in with Apple" identity token 을 애플 공개키(JWKS)로 검증한다 */
@Injectable()
export class Holy365AppleVerifier {
  private keys: { at: number; byKid: Map<string, JsonWebKey> } | null = null;

  private async key(kid: string): Promise<JsonWebKey | undefined> {
    if (!this.keys || Date.now() - this.keys.at > KEYS_TTL_MS || !this.keys.byKid.has(kid)) {
      const { data } = await axios.get<{ keys: (JsonWebKey & { kid: string })[] }>(KEYS_URL, { timeout: 8000 });
      this.keys = { at: Date.now(), byKid: new Map(data.keys.map(k => [k.kid, k])) };
    }
    return this.keys.byKid.get(kid);
  }

  /** 검증되면 애플 사용자 ID(sub)와 이메일(있으면), 아니면 null */
  async verify(identityToken: string): Promise<{ sub: string; email: string | null } | null> {
    const decoded = jwt.decode(identityToken, { complete: true });
    const kid = decoded && typeof decoded === 'object' ? decoded.header.kid : undefined;
    if (!kid) return null;

    const jwk = await this.key(kid);
    if (!jwk) return null;

    let claims: Holy365AppleClaims;
    try {
      const pem = createPublicKey({ key: jwk, format: 'jwk' }).export({ type: 'spki', format: 'pem' });
      claims = jwt.verify(identityToken, pem, { algorithms: ['RS256'] }) as Holy365AppleClaims;
    } catch {
      return null;
    }
    if (appleClaimsError(claims, holy365AppleAudiences(), Math.floor(Date.now() / 1000))) return null;

    return { sub: claims.sub!, email: claims.email ?? null };
  }
}
