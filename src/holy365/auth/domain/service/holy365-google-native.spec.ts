import { googleClaimsError } from '@/holy365/auth/domain/service/holy365-google-native';

describe('googleClaimsError — 앱 구글 ID 토큰 내용 확인', () => {
  const now = 1_800_000_000;
  const aud = ['ios-client.apps.googleusercontent.com'];
  const ok = { iss: 'https://accounts.google.com', aud: aud[0], sub: '1234', exp: now + 60 };

  it('정상 토큰은 통과 (발급자 표기 두 가지 모두)', () => {
    expect(googleClaimsError(ok, aud, now)).toBeNull();
    expect(googleClaimsError({ ...ok, iss: 'accounts.google.com' }, aud, now)).toBeNull();
  });

  it('다른 발급자 · 다른 클라이언트 · 만료 · 사용자 없음은 거부', () => {
    expect(googleClaimsError({ ...ok, iss: 'https://evil.example' }, aud, now)).toBe('issuer');
    expect(googleClaimsError({ ...ok, aud: 'web-client' }, aud, now)).toBe('audience');
    expect(googleClaimsError({ ...ok, exp: now - 1 }, aud, now)).toBe('expired');
    expect(googleClaimsError({ ...ok, sub: undefined }, aud, now)).toBe('subject');
  });
});
