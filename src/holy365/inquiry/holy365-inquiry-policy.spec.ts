import { inquiryEmail, normalizeInquiry } from '@/holy365/inquiry/holy365-inquiry-policy';

describe('문의 입력 정리', () => {
  it('본문 공백·빈 줄 정리', () => {
    expect(normalizeInquiry('  안녕하세요\r\n\n\n\n질문이요  ')).toBe('안녕하세요\n\n질문이요');
    expect(normalizeInquiry(undefined)).toBe('');
  });

  it('이메일은 형식이 맞을 때만', () => {
    expect(inquiryEmail(' Grace@Example.com ')).toBe('grace@example.com');
    expect(inquiryEmail('not-an-email')).toBeNull();
    expect(inquiryEmail('')).toBeNull();
  });
});
