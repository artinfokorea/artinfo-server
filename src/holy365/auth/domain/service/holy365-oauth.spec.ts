import { buildAuthorizeUrl, HOLY365_SNS_PROVIDER, isAllowedRedirectUri } from '@/holy365/auth/domain/service/holy365-oauth';

describe('buildAuthorizeUrl — 제공자 로그인 화면 주소', () => {
  const params = { clientId: 'cid', redirectUri: 'http://localhost:3000/ko/auth/callback/google', state: 'st8' };

  it('구글 — openid email profile 범위', () => {
    const url = new URL(buildAuthorizeUrl(HOLY365_SNS_PROVIDER.GOOGLE, params));
    expect(url.origin + url.pathname).toBe('https://accounts.google.com/o/oauth2/v2/auth');
    expect(url.searchParams.get('client_id')).toBe('cid');
    expect(url.searchParams.get('redirect_uri')).toBe('http://localhost:3000/ko/auth/callback/google');
    expect(url.searchParams.get('response_type')).toBe('code');
    expect(url.searchParams.get('scope')).toBe('openid email profile');
    expect(url.searchParams.get('state')).toBe('st8');
  });

  it('카카오', () => {
    const url = new URL(buildAuthorizeUrl(HOLY365_SNS_PROVIDER.KAKAO, params));
    expect(url.origin + url.pathname).toBe('https://kauth.kakao.com/oauth/authorize');
    expect(url.searchParams.get('response_type')).toBe('code');
    expect(url.searchParams.get('state')).toBe('st8');
  });

  it('네이버', () => {
    const url = new URL(buildAuthorizeUrl(HOLY365_SNS_PROVIDER.NAVER, params));
    expect(url.origin + url.pathname).toBe('https://nid.naver.com/oauth2.0/authorize');
    expect(url.searchParams.get('client_id')).toBe('cid');
    expect(url.searchParams.get('state')).toBe('st8');
  });
});

describe('isAllowedRedirectUri — 허용한 출처의 콜백만', () => {
  const allowed = ['http://localhost:3000', 'https://holy365.kr'];

  it('허용 출처의 /auth/callback/ 경로면 통과', () => {
    expect(isAllowedRedirectUri('https://holy365.kr/zh/auth/callback/naver', allowed)).toBe(true);
    expect(isAllowedRedirectUri('http://localhost:3000/ko/auth/callback/kakao', allowed)).toBe(true);
  });

  it('출처가 다르거나 경로가 다르면 거부', () => {
    expect(isAllowedRedirectUri('https://evil.com/ko/auth/callback/naver', allowed)).toBe(false);
    expect(isAllowedRedirectUri('https://holy365.kr/ko/other', allowed)).toBe(false);
    expect(isAllowedRedirectUri('not a url', allowed)).toBe(false);
  });
});
