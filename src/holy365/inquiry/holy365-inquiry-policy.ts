export const HOLY365_INQUIRY_CATEGORIES = ['question', 'bug', 'account', 'suggestion', 'other'] as const;
export type Holy365InquiryCategory = (typeof HOLY365_INQUIRY_CATEGORIES)[number];
export const HOLY365_INQUIRY_MAX = 3000;

/** 문의 본문 정리 — 앞뒤 공백 제거, 줄바꿈 통일, 3줄 이상 빈 줄은 2줄로 */
export function normalizeInquiry(message: string | null | undefined): string {
  return (message ?? '')
    .normalize('NFC')
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** 답장 받을 이메일 — 형식이 이상하면 버린다 (로그인 사용자는 계정 이메일로 답장 가능) */
export function inquiryEmail(email: string | null | undefined): string | null {
  const value = (email ?? '').trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value) && value.length <= 200 ? value : null;
}
