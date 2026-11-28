import { Injectable } from '@nestjs/common';
import { appleClaimsError, Holy365AppleClaims, holy365AppleAudiences } from '@/holy365/auth/domain/service/holy365-apple';
import { Holy365JwksVerifier } from '@/holy365/auth/infrastructure/holy365-jwks';

/** iOS 앱의 "Sign in with Apple" identity token 을 애플 공개키로 검증한다 */
@Injectable()
export class Holy365AppleVerifier {
  private readonly jwks = new Holy365JwksVerifier('https://appleid.apple.com/auth/keys');

  /** 검증되면 애플 사용자 ID(sub)와 이메일(있으면), 아니면 null */
  async verify(identityToken: string): Promise<{ sub: string; email: string | null } | null> {
    const claims = await this.jwks.verify<Holy365AppleClaims>(identityToken);
    if (!claims || appleClaimsError(claims, holy365AppleAudiences(), Math.floor(Date.now() / 1000))) return null;
    return { sub: claims.sub!, email: claims.email ?? null };
  }
}
