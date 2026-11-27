export const HOLY365_AVATAR_MAX_BYTES = 10 * 1024 * 1024;

/** SVG 는 스크립트를 품을 수 있어 받지 않는다. 저장할 때는 400×400 WebP 로 바꾼다 */
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

export function isAllowedAvatar(mimetype: string, size: number): boolean {
  return ALLOWED.has(mimetype) && size > 0 && size <= HOLY365_AVATAR_MAX_BYTES;
}

export function avatarPath(userId: number, random: string, now: number): string {
  return `holy365/avatars/${userId}/${random}.${now}.webp`;
}
