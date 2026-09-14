import { buildInquiryNotifyMail, inquiryStatusOf, normalizeInquiryText, ONGI_INQUIRY_MAX_LENGTH } from '@/ongi/inquiry/domain/service/ongi-inquiry-policy';

describe('normalizeInquiryText — 문의·답변 본문', () => {
  it('앞뒤 공백을 걷어낸 본문을 돌려준다', () => {
    expect(normalizeInquiryText('  사진이 안 올라가요\n')).toBe('사진이 안 올라가요');
  });

  it('비어 있거나 공백뿐이면 null', () => {
    expect(normalizeInquiryText('')).toBeNull();
    expect(normalizeInquiryText('   \n\t ')).toBeNull();
    expect(normalizeInquiryText(undefined)).toBeNull();
  });

  it('최대 2000자까지 허용하고 넘으면 null', () => {
    expect(ONGI_INQUIRY_MAX_LENGTH).toBe(2000);
    expect(normalizeInquiryText('가'.repeat(2000))).toBe('가'.repeat(2000));
    expect(normalizeInquiryText('가'.repeat(2001))).toBeNull();
  });

  it('길이는 공백을 걷어낸 뒤로 센다', () => {
    expect(normalizeInquiryText(`  ${'가'.repeat(2000)}  `)).toBe('가'.repeat(2000));
  });
});

describe('inquiryStatusOf — 답변 여부로 상태가 정해진다', () => {
  it('답변이 없으면 open', () => {
    expect(inquiryStatusOf(null)).toBe('open');
  });

  it('답변이 있으면 answered', () => {
    expect(inquiryStatusOf('확인해 보니 해결됐어요.')).toBe('answered');
  });
});

describe('buildInquiryNotifyMail — 운영자에게 가는 문의 접수 메일', () => {
  it('제목에 작성자 이름, 본문에 문의 id · 작성자 · 내용', () => {
    const mail = buildInquiryNotifyMail({ inquiryId: 12, userId: 7, userName: '엄마', userEmail: 'mom@naver.com', content: '사진이 안 올라가요' });

    expect(mail.to).toBe('chorales@naver.com');
    expect(mail.subject).toBe('[온기 문의] 엄마');
    expect(mail.html).toContain('<p><b>문의 ID</b>: 12</p>');
    expect(mail.html).toContain('<p><b>작성자</b>: 엄마 (#7) / mom@naver.com</p>');
    expect(mail.html).toContain('사진이 안 올라가요');
  });

  it('사용자가 쓴 내용·이름의 HTML 은 이스케이프한다', () => {
    const mail = buildInquiryNotifyMail({ inquiryId: 1, userId: 2, userName: '<b>해커</b>', userEmail: null, content: '<script>alert(1)</script> & "q"' });

    expect(mail.html).toContain('&lt;script&gt;alert(1)&lt;/script&gt; &amp; &quot;q&quot;');
    expect(mail.html).toContain('&lt;b&gt;해커&lt;/b&gt; (#2) / 이메일 없음');
    expect(mail.html).not.toContain('<script>');
  });

  it('제목의 줄바꿈은 공백으로 — 메일 헤더 주입 방지', () => {
    const mail = buildInquiryNotifyMail({ inquiryId: 1, userId: 2, userName: '엄마\r\nBcc: x@y.com', userEmail: null, content: '내용' });

    expect(mail.subject).toBe('[온기 문의] 엄마  Bcc: x@y.com');
  });
});
