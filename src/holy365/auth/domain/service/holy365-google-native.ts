/** 앱(iOS)용 구글 OAuth 클라이언트 ID — HOLY365_GOOGLE_IOS_CLIENT_ID (쉼표 구분). 공개값이라 기본값을 둔다 */
export function holy365GoogleNativeAudiences(): string[] {
  return (process.env['HOLY365_GOOGLE_IOS_CLIENT_ID'] ?? '872236907087-4e2eokbu9cbrgu3448rgmnqrg5a14ntl.apps.googleusercontent.com')
    .split(',')
    .map(id => id.trim())
    .filter(Boolean);
}

export interface Holy365GoogleClaims {
  iss?: string;
  aud?: string;
  sub?: string;
  exp?: number;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
}

const ISSUERS = ['accounts.google.com', 'https://accounts.google.com'];

/** 서명 검증이 끝난 구글 ID 토큰 내용 확인 — 발급자 · 우리 앱 클라이언트 · 만료 · 사용자 ID */
export function googleClaimsError(claims: Holy365GoogleClaims, audiences: string[], nowSeconds: number): string | null {
  if (!claims.iss || !ISSUERS.includes(claims.iss)) return 'issuer';
  if (!claims.aud || !audiences.includes(claims.aud)) return 'audience';
  if (!claims.exp || claims.exp <= nowSeconds) return 'expired';
  if (!claims.sub) return 'subject';
  return null;
}
