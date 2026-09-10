import * as sharp from 'sharp';

/** 우리 S3 버킷 (aws-s3.service.ts 와 같은 값) */
export const SALPYEO_IMAGE_BUCKET = 'artinfo';

const DOWNLOAD_TIMEOUT_MS = 15_000;
const MAX_BYTES = 12 * 1024 * 1024;

export const SALPYEO_IMAGE_EXTENSION: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export interface FetchedImage {
  buffer: Buffer;
  mimetype: string;
}

/** 이미 우리 버킷으로 옮긴 사진인지 */
export function isOurBucketUrl(url: string): boolean {
  return url.includes(`${SALPYEO_IMAGE_BUCKET}.s3.`);
}

/**
 * 조리원 홈페이지의 사진을 내려받는다. 실패하면 null — 호출 쪽은 원래 URL 을 그대로 남긴다.
 *
 * - Referer 를 붙여 핫링크 차단을 피한다 (원본 페이지에서 온 것처럼)
 * - Content-Type 을 못 믿는 서버가 있어 실제 바이트로 형식을 다시 확인한다
 */
export async function fetchExternalImage(url: string): Promise<FetchedImage | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DOWNLOAD_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; salpyeo-image-rehost/1.0)', Referer: new URL(url).origin },
    });
    if (!res.ok) return null;

    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length === 0 || buffer.length > MAX_BYTES) return null;

    const { format } = await sharp(buffer).metadata();
    const mimetype = format === 'png' ? 'image/png' : format === 'webp' ? 'image/webp' : format === 'jpeg' ? 'image/jpeg' : '';
    if (!SALPYEO_IMAGE_EXTENSION[mimetype]) return null;

    return { buffer, mimetype };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** S3 키 — 스크립트와 API 가 같은 규칙을 쓴다 */
export function salpyeoImageKeyPath(slug: string, index: number, mimetype: string): string {
  return ['salpyeo', 'facilities', slug, `${index}-${Date.now()}.${SALPYEO_IMAGE_EXTENSION[mimetype]}`].join('/');
}
