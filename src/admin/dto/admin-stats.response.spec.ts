import { maskEmail } from '@/admin/dto/admin-stats.response';

describe('maskEmail', () => {
  it('아이디 앞 두 글자만 남기고 가린다', () => {
    expect(maskEmail('choral7451@gmail.com')).toBe('ch***@gmail.com');
  });

  it('아이디가 한 글자여도 가린다', () => {
    expect(maskEmail('a@artinfo.com')).toBe('a***@artinfo.com');
  });

  it('@ 가 없으면 앞 두 글자만', () => {
    expect(maskEmail('noemail')).toBe('no***');
  });

  it('비어 있으면 빈 문자열', () => {
    expect(maskEmail('')).toBe('');
    expect(maskEmail(null)).toBe('');
  });
});
