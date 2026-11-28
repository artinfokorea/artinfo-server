export const HOLY365_APPLE_TYPE = 'apple';
export const HOLY365_APPLE_ISSUER = 'https://appleid.apple.com';

/** 애플 로그인 토큰을 받을 앱 번들 ID — HOLY365_APPLE_BUNDLE_IDS (쉼표 구분), 없으면 iOS 앱 기본값 */
export function holy365AppleAudiences(): string[] {
  return (process.env['HOLY365_APPLE_BUNDLE_IDS'] ?? 'com.artinfokorea.holy365')
    .split(',')
    .map(id => id.trim())
    .filter(Boolean);
}

export interface Holy365AppleClaims {
  iss?: string;
  aud?: string | string[];
  sub?: string;
  exp?: number;
  email?: string;
}

/** 서명 검증이 끝난 토큰의 내용 확인 — 발급자 · 대상 앱 · 만료 · 사용자 ID */
export function appleClaimsError(claims: Holy365AppleClaims, audiences: string[], nowSeconds: number): string | null {
  if (claims.iss !== HOLY365_APPLE_ISSUER) return 'issuer';
  const aud = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  if (!aud.some(value => value && audiences.includes(value))) return 'audience';
  if (!claims.exp || claims.exp <= nowSeconds) return 'expired';
  if (!claims.sub) return 'subject';

  return null;
}

/** 애플은 이름을 첫 로그인 때 앱에만 한 번 준다 — 앱이 보낸 이름을 이어 붙여 쓴다 */
export function appleDisplayName(given?: string | null, family?: string | null): string | null {
  const name = [given, family]
    .map(part => part?.trim())
    .filter(Boolean)
    .join(' ');
  return name || null;
}
