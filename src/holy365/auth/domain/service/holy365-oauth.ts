export enum HOLY365_SNS_PROVIDER {
  GOOGLE = 'google',
  KAKAO = 'kakao',
  NAVER = 'naver',
}

export interface Holy365AuthorizeParams {
  clientId: string;
  redirectUri: string;
  state: string;
}

const AUTHORIZE_ENDPOINTS: Record<HOLY365_SNS_PROVIDER, string> = {
  [HOLY365_SNS_PROVIDER.GOOGLE]: 'https://accounts.google.com/o/oauth2/v2/auth',
  [HOLY365_SNS_PROVIDER.KAKAO]: 'https://kauth.kakao.com/oauth/authorize',
  [HOLY365_SNS_PROVIDER.NAVER]: 'https://nid.naver.com/oauth2.0/authorize',
};

/** 웹 OAuth(authorization code) — 제공자 로그인 화면 주소. 콜백에서 받은 code 는 서버가 client secret 으로 교환한다 */
export function buildAuthorizeUrl(provider: HOLY365_SNS_PROVIDER, { clientId, redirectUri, state }: Holy365AuthorizeParams): string {
  const url = new URL(AUTHORIZE_ENDPOINTS[provider]);
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('state', state);
  if (provider === HOLY365_SNS_PROVIDER.GOOGLE) {
    url.searchParams.set('scope', 'openid email profile');
    url.searchParams.set('prompt', 'select_account');
  }

  return url.toString();
}

/** 콜백 주소는 허용한 출처(HOLY365_WEB_ORIGINS)의 /{locale}/auth/callback/{provider} 만 받는다 */
export function isAllowedRedirectUri(redirectUri: string, allowedOrigins: string[]): boolean {
  try {
    const url = new URL(redirectUri);

    return allowedOrigins.includes(url.origin) && /^\/[a-z]{2}(-[A-Za-z]+)?\/auth\/callback\/[a-z]+$/.test(url.pathname);
  } catch {
    return false;
  }
}
