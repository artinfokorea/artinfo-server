import { OnchurchCustomPageSlugReserved } from '@/onchurch/custom-page/domain/exception/onchurch-custom-page.exception';

// 공개 경로가 /p/:slug 라서 고정 페이지(/about, /notices …)와는 구조적으로 충돌하지 않는다.
// 다만 링크를 옮길 여지를 남겨두고, 라우팅에 혼동을 주는 값만 막는다.
const RESERVED_SLUGS = new Set(['p', 'api', 'admin', 'login', 'logout', 'mypage', 'new', 'edit']);

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// 영문 소문자·숫자·하이픈만 허용한다. 한글 제목은 프론트에서 영문 slug를 따로 입력받는다.
export function normalizeCustomPageSlug(raw: string): string {
  const slug = (raw ?? '').trim().toLowerCase();
  if (!slug || slug.length > 80 || !SLUG_PATTERN.test(slug) || RESERVED_SLUGS.has(slug)) {
    throw new OnchurchCustomPageSlugReserved();
  }
  return slug;
}
