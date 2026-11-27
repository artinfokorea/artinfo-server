/**
 * 필사 비교 규칙 — 프론트(holy365-front/src/lib/typing.ts)와 같은 규칙을 써야 한다.
 * 키보드로 치기 어려운 문자(둥근 따옴표, 특수 공백)만 너그럽게 보고 나머지는 글자 그대로 비교한다.
 */
export function normalizeVerseText(text: string): string {
  return text
    .normalize('NFC')
    .replace(/[‘’‚‛′`´]/g, "'")
    .replace(/[“”„‟″]/g, '"')
    .replace(/[  -​　]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function isTypedMatch(original: string, typed: string): boolean {
  const expected = normalizeVerseText(original);
  if (!expected) return false;

  return expected === normalizeVerseText(typed);
}
