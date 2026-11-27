const MAX_QUERY_LENGTH = 50;
const MAX_TERMS = 5;

/** 본문 검색어 → 단어 목록. 띄어 쓴 단어가 모두 들어간 절을 찾는다 */
export function searchTerms(query: string): string[] {
  const normalized = query.normalize('NFC').replace(/\s+/g, ' ').trim();
  if (!normalized || normalized.length > MAX_QUERY_LENGTH) return [];

  return [...new Set(normalized.split(' '))].slice(0, MAX_TERMS);
}

/** ILIKE 패턴 — 사용자가 친 % _ 백슬래시는 글자 그대로 찾는다 */
export function likePattern(term: string): string {
  return `%${term.replace(/[\\%_]/g, char => `\\${char}`)}%`;
}
