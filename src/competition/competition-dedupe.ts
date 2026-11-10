/**
 * 같은 콩쿠르를 URL 이 달라도 알아보기 위한 키.
 * 제목에서 회차·연도·괄호·기호·공백을 떼고, 주최에서 법인 접두어를 뗀 뒤 "제목|주최" 로 만든다.
 * 접수 마감일 ±3일은 SQL 에서 같이 본다 (키만 같고 해가 다른 대회를 한 건으로 묶지 않게).
 */
export function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/\([^)]*\)|\[[^\]]*\]/g, ' ') // 괄호 안 설명
    .replace(/제?\s*\d+\s*(회|차|기|th|st|nd|rd)/gi, ' ') // 제13회 · 6th
    .replace(/\b(19|20)\d{2}\s*(년|학년도)?/g, ' ') // 연도
    .replace(/(상|하)반기|전기|후기/g, ' ')
    .replace(/[^0-9a-z가-힣]/g, ''); // 기호·공백 제거
}

export function normalizeHost(host: string): string {
  return host
    .toLowerCase()
    .replace(/\((사|재|주|사단|재단)\)|사단법인|재단법인|주식회사|\(주\)|㈜|\(사\)|\(재\)/g, ' ')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[^0-9a-z가-힣]/g, '');
}

export function dedupeKey(title: string, host: string): string {
  return `${normalizeTitle(title)}|${normalizeHost(host)}`;
}

/** 마감일이 이 범위(일) 안이면 같은 회차로 본다 */
export const DEDUPE_CLOSE_AT_DAYS = 3;
