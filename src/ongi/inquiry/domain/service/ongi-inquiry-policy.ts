export const ONGI_INQUIRY_MAX_LENGTH = 2000;

export type OngiInquiryStatus = 'open' | 'answered';

/** 문의·답변 본문 — 앞뒤 공백을 걷어내고, 비었거나 2000자를 넘으면 null */
export function normalizeInquiryText(raw: string | undefined | null): string | null {
  const text = (raw ?? '').trim();
  if (text.length === 0 || text.length > ONGI_INQUIRY_MAX_LENGTH) return null;

  return text;
}

/** 상태는 따로 저장하지 않고 답변 유무로 정한다 — 답변을 쓰는 순간 answered */
export function inquiryStatusOf(answer: string | null): OngiInquiryStatus {
  return answer === null ? 'open' : 'answered';
}

/** 문의가 들어오면 알림 메일을 받을 운영자 주소 */
export const ONGI_INQUIRY_NOTIFY_TO = 'chorales@naver.com';

const escapeHtml = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** 운영자 알림 메일 — 사용자가 쓴 값은 모두 이스케이프, 제목 줄바꿈은 공백으로 (헤더 주입 방지) */
export function buildInquiryNotifyMail(params: { inquiryId: number; userId: number; userName: string; userEmail: string | null; content: string }): {
  to: string;
  subject: string;
  html: string;
} {
  const { inquiryId, userId, userName, userEmail, content } = params;

  return {
    to: ONGI_INQUIRY_NOTIFY_TO,
    subject: `[온기 문의] ${userName.replace(/[\r\n]/g, ' ')}`,
    html: [
      `<h3>온기 문의가 접수되었습니다</h3>`,
      `<p><b>문의 ID</b>: ${inquiryId}</p>`,
      `<p><b>작성자</b>: ${escapeHtml(userName)} (#${userId}) / ${userEmail ? escapeHtml(userEmail) : '이메일 없음'}</p>`,
      `<p>답변은 관리자 페이지에서 작성해 주세요: https://www.ongifamily.com/admin?tab=inquiries</p>`,
      `<hr />`,
      `<pre style="white-space: pre-wrap; font-family: inherit;">${escapeHtml(content)}</pre>`,
    ].join(''),
  };
}
