import { createHash, createHmac } from 'crypto';

/**
 * 온기 사진·아바타는 S3 에 private 으로 저장하고, 응답할 때만 presigned GET URL 로 바꿔 내려준다.
 *
 * - 서명 시각(X-Amz-Date)을 3일 창(window) 시작으로 정렬해 같은 창 안에서는 URL 이 동일 → 앱(expo-image)·웹(next/image) 캐시가 유지된다.
 * - 유효기간은 7일(SigV4 최대)이라 창이 바뀌어도 이전 URL 이 4일은 더 살아 있어, 캐시된 목록이 갑자기 깨지지 않는다.
 * - 동기 HMAC 연산이라 목록 수백 장도 ms 단위. AWS SDK 의 getSignedUrl 은 async 라 DTO 생성자에서 못 쓰므로 직접 구현.
 */
const WINDOW_MS = 3 * 24 * 60 * 60 * 1000;
const EXPIRES_SEC = 7 * 24 * 60 * 60;
const ONGI_PREFIX = /\/ongi\//;

const hmac = (key: Buffer | string, data: string) => createHmac('sha256', key).update(data, 'utf8').digest();
const sha256Hex = (data: string) => createHash('sha256').update(data, 'utf8').digest('hex');
const rfc3986 = (s: string) => encodeURIComponent(s).replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase());

function parseBucketUrl(url: string): { host: string; region: string; key: string } | null {
  const m = url.match(/^https:\/\/([a-z0-9.-]+)\.s3\.([a-z0-9-]+)\.amazonaws\.com\/(.+)$/);
  if (!m) return null;
  return { host: `${m[1]}.s3.${m[2]}.amazonaws.com`, region: m[2], key: decodeURIComponent(m[3]) };
}

/** 우리 버킷의 온기 경로(…/ongi/…)만 서명한다. 소셜 프로필·기본 이미지 같은 외부 URL 은 그대로 */
export function signOngiMediaUrl<T extends string | null | undefined>(url: T): T {
  if (!url || !ONGI_PREFIX.test(url)) return url;
  const accessKey = process.env['AWS_ACCESS_KEY'];
  const secretKey = process.env['AWS_SECRET_ACCESS_KEY'];
  if (!accessKey || !secretKey) return url;
  const parsed = parseBucketUrl(url);
  if (!parsed) return url;

  const windowStart = new Date(Math.floor(Date.now() / WINDOW_MS) * WINDOW_MS);
  const amzDate = windowStart.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z'); // YYYYMMDDTHHMMSSZ
  const dateStamp = amzDate.slice(0, 8);
  const scope = `${dateStamp}/${parsed.region}/s3/aws4_request`;

  const query: [string, string][] = [
    ['X-Amz-Algorithm', 'AWS4-HMAC-SHA256'],
    ['X-Amz-Credential', `${accessKey}/${scope}`],
    ['X-Amz-Date', amzDate],
    ['X-Amz-Expires', String(EXPIRES_SEC)],
    ['X-Amz-SignedHeaders', 'host'],
  ];
  const canonicalQuery = query
    .map(([k, v]) => [rfc3986(k), rfc3986(v)] as const)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([k, v]) => `${k}=${v}`)
    .join('&');
  const canonicalUri = '/' + parsed.key.split('/').map(rfc3986).join('/');
  const canonicalRequest = ['GET', canonicalUri, canonicalQuery, `host:${parsed.host}\n`, 'host', 'UNSIGNED-PAYLOAD'].join('\n');
  const stringToSign = ['AWS4-HMAC-SHA256', amzDate, scope, sha256Hex(canonicalRequest)].join('\n');

  const kDate = hmac('AWS4' + secretKey, dateStamp);
  const kRegion = hmac(kDate, parsed.region);
  const kService = hmac(kRegion, 's3');
  const kSigning = hmac(kService, 'aws4_request');
  const signature = createHmac('sha256', kSigning).update(stringToSign, 'utf8').digest('hex');

  return `https://${parsed.host}${canonicalUri}?${canonicalQuery}&X-Amz-Signature=${signature}` as T;
}
