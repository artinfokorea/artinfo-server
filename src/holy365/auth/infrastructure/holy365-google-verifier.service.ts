import { Injectable } from '@nestjs/common';
import { googleClaimsError, Holy365GoogleClaims, holy365GoogleNativeAudiences } from '@/holy365/auth/domain/service/holy365-google-native';
import { Holy365JwksVerifier } from '@/holy365/auth/infrastructure/holy365-jwks';

/** iOS 앱 구글 로그인이 준 ID 토큰을 구글 공개키로 검증한다 */
@Injectable()
export class Holy365GoogleVerifier {
  private readonly jwks = new Holy365JwksVerifier('https://www.googleapis.com/oauth2/v3/certs');

  async verify(idToken: string): Promise<{ sub: string; email: string | null; name: string | null; picture: string | null } | null> {
    const claims = await this.jwks.verify<Holy365GoogleClaims>(idToken);
    if (!claims || googleClaimsError(claims, holy365GoogleNativeAudiences(), Math.floor(Date.now() / 1000))) return null;
    return {
      sub: claims.sub!,
      email: claims.email_verified === false ? null : (claims.email ?? null),
      name: claims.name ?? null,
      picture: claims.picture ?? null,
    };
  }
}
