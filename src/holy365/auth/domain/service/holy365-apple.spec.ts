import { appleClaimsError, appleDisplayName, HOLY365_APPLE_ISSUER } from '@/holy365/auth/domain/service/holy365-apple';

describe('appleClaimsError — 애플 identity token 내용 확인', () => {
  const now = 1_800_000_000;
  const ok = { iss: HOLY365_APPLE_ISSUER, aud: 'com.holy365.app', sub: '001.abc', exp: now + 60 };

  it('정상 토큰은 통과', () => {
    expect(appleClaimsError(ok, ['com.holy365.app'], now)).toBeNull();
  });

  it('다른 발급자 · 다른 앱 · 만료 · 사용자 없음은 거부', () => {
    expect(appleClaimsError({ ...ok, iss: 'https://evil.example' }, ['com.holy365.app'], now)).toBe('issuer');
    expect(appleClaimsError({ ...ok, aud: 'com.other.app' }, ['com.holy365.app'], now)).toBe('audience');
    expect(appleClaimsError({ ...ok, exp: now }, ['com.holy365.app'], now)).toBe('expired');
    expect(appleClaimsError({ ...ok, sub: '' }, ['com.holy365.app'], now)).toBe('subject');
  });
});

describe('appleDisplayName', () => {
  it('이름과 성을 이어 붙이고 비어 있으면 null', () => {
    expect(appleDisplayName('Grace', 'Park')).toBe('Grace Park');
    expect(appleDisplayName(' Grace ', null)).toBe('Grace');
    expect(appleDisplayName('', undefined)).toBeNull();
  });
});
