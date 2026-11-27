export type Holy365Aspect = '1:1' | '4:5';

export const HOLY365_ASPECTS: Holy365Aspect[] = ['1:1', '4:5'];
export const HOLY365_POST_MAX_IMAGES = 10;
export const HOLY365_POST_MAX_CONTENT = 2000;
export const HOLY365_POST_MAX_VERSES = 10;
export const HOLY365_COMMENT_MAX_CONTENT = 500;

/** 저장할 사진 크기 — 정사각형 1080×1080, 세로형 1080×1350 (가운데 기준으로 자른다) */
export function aspectSize(aspect: Holy365Aspect): { width: number; height: number } {
  return aspect === '4:5' ? { width: 1080, height: 1350 } : { width: 1080, height: 1080 };
}

export function feedImagePath(userId: number, random: string, now: number): string {
  return `holy365/feed/${userId}/${random}.${now}.webp`;
}

/** 게시물에 붙일 수 있는 사진 — 그 사용자가 우리 버킷 피드 경로에 올린 것만 (남의 URL·외부 URL 거부) */
export function isFeedImageUrl(url: string, userId: number): boolean {
  try {
    const parsed = new URL(url);
    return /^artinfo\.s3\.[a-z0-9-]+\.amazonaws\.com$/.test(parsed.host) && new RegExp(`^/[^/]+/holy365/feed/${userId}/[^/]+\\.webp$`).test(parsed.pathname);
  } catch {
    return false;
  }
}

export function normalizePostContent(content: string | null | undefined): string {
  return (content ?? '')
    .normalize('NFC')
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export type Holy365PostError = 'empty' | 'tooLong' | 'tooManyImages';

export function validatePostInput(input: { content: string; imageCount: number; hasVerse: boolean }): Holy365PostError | null {
  const content = normalizePostContent(input.content);
  if (content.length > HOLY365_POST_MAX_CONTENT) return 'tooLong';
  if (input.imageCount > HOLY365_POST_MAX_IMAGES) return 'tooManyImages';
  if (!content && input.imageCount === 0 && !input.hasVerse) return 'empty';

  return null;
}

export function validateVerseRange(start: number, end: number): boolean {
  return Number.isInteger(start) && Number.isInteger(end) && start >= 1 && end >= start && end - start + 1 <= HOLY365_POST_MAX_VERSES;
}
