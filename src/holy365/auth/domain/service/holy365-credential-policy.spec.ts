import { isValidPassword, normalizeDisplayName, normalizeEmail } from '@/holy365/auth/domain/service/holy365-credential-policy';

describe('normalizeEmail', () => {
  it('앞뒤 공백을 걷고 소문자로', () => {
    expect(normalizeEmail('  Joel@Example.COM ')).toBe('joel@example.com');
  });

  it('형식이 틀리면 null', () => {
    expect(normalizeEmail('joel@')).toBeNull();
    expect(normalizeEmail('joel example.com')).toBeNull();
    expect(normalizeEmail('')).toBeNull();
    expect(normalizeEmail(undefined)).toBeNull();
  });

  it('254자를 넘으면 null', () => {
    expect(normalizeEmail(`${'a'.repeat(250)}@b.co`)).toBeNull();
  });
});

describe('isValidPassword — 8~64자, 영문과 숫자 포함', () => {
  it('조건을 채우면 통과', () => {
    expect(isValidPassword('grace2026')).toBe(true);
    expect(isValidPassword('Abcdefg1!')).toBe(true);
  });

  it('짧거나 길면 실패', () => {
    expect(isValidPassword('abc123')).toBe(false);
    expect(isValidPassword(`a1${'x'.repeat(63)}`)).toBe(false);
  });

  it('영문이나 숫자가 없으면 실패', () => {
    expect(isValidPassword('12345678')).toBe(false);
    expect(isValidPassword('abcdefgh')).toBe(false);
  });
});

describe('normalizeDisplayName — 1~30자', () => {
  it('앞뒤 공백을 걷는다', () => {
    expect(normalizeDisplayName('  요엘 ')).toBe('요엘');
  });

  it('비었거나 30자를 넘으면 null', () => {
    expect(normalizeDisplayName('   ')).toBeNull();
    expect(normalizeDisplayName('가'.repeat(31))).toBeNull();
    expect(normalizeDisplayName('가'.repeat(30))).toBe('가'.repeat(30));
  });
});
