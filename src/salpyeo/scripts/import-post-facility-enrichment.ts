import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { resolve, join } from 'path';
import { SALPYEO_POST_FACILITY_RECORDS } from '@/salpyeo/facility/domain/constant/salpyeo-post-facility-data.constant';
import { postFacilitySlug } from '@/salpyeo/facility/domain/service/salpyeo-post-facility-seed';

/**
 * 조리원 공식 홈페이지에서 수집한 JSON(<slug>.json) → 살펴 보강 상수 변환.
 *
 *   npx ts-node -r tsconfig-paths/register src/salpyeo/scripts/import-post-facility-enrichment.ts <수집 디렉터리> [--verify-images]
 *
 * - 공공데이터(보건복지부)에 없거나 다른 값만 담는다. 공공데이터와 같은 값은 굳이 넣지 않는다.
 * - 검증에 실패한 값은 버린다 (지어낸 값·깨진 URL 이 배포로 새어나가지 않도록):
 *   · website/이미지: http(s) 절대 URL + 이미지 확장자 + 호스트가 **공식 도메인이거나 알려진 홈페이지 빌더 CDN**
 *   · 요금: 50만 ~ 3,000만원 (2주 총액 범위 밖이면 오기입으로 보고 버림)
 *   · 전화: 숫자 9~11자리
 * - `--verify-images` 를 주면 사진을 실제로 받아 200 + image/* + 400x300 이상인 것만 남기고 픽셀 크기를 채운다.
 * - 결과는 domain/constant/salpyeo-post-facility-enrichment.constant.ts 에 덮어쓴다 (커밋 대상, 손으로 수정 금지).
 */

const OUTPUT = resolve(__dirname, '../facility/domain/constant/salpyeo-post-facility-enrichment.constant.ts');
const MIN_PRICE = 500_000;
const MAX_PRICE = 30_000_000;
const MAX_IMAGES = 6;
const MIN_IMAGE_WIDTH = 400;
const MIN_IMAGE_HEIGHT = 300;
const VERIFY_CONCURRENCY = 16;
const IMAGE_EXT = /\.(jpe?g|png|webp)(\?.*)?$/i;

/**
 * 홈페이지 빌더·호스팅이 쓰는 이미지 CDN — 공식 사이트의 사진이 여기 올라간다.
 * (국내 조리원 홈페이지는 아임웹·카페24·워드프레스·병원 홈페이지 제작사를 많이 쓴다)
 * 이 목록에 없으면 "홈페이지와 같은 등록 도메인" 인 사진만 받아들인다.
 */
const IMAGE_CDN_SUFFIXES = [
  'imweb.me',
  'drline.net',
  'cafe24.com',
  'cafe24img.com',
  'wixstatic.com',
  'sixshop.com',
  'cloudfront.net',
  'amazonaws.com',
  'godohosting.com',
  'gabia.io',
  'ncloudstorage.com',
  'nhncloud.com',
  'toastoven.net',
  'creatorlink.net',
  'modoo.at',
  'wp.com', // 워드프레스 Jetpack 이미지 CDN (i0/i1/i2.wp.com — 원본 사이트 이미지를 그대로 프록시)
];

interface CollectedImage {
  url?: unknown;
  alt?: unknown;
  sourceUrl?: unknown;
}

interface Collected {
  slug?: unknown;
  website?: unknown;
  phone?: unknown;
  address?: unknown;
  standardRoomPrice?: unknown;
  specialRoomPrice?: unknown;
  priceNote?: unknown;
  priceSourceUrl?: unknown;
  images?: unknown;
}

interface VerifiedImage {
  url: string;
  alt: string;
  sourceUrl: string | null;
  width: number;
  height: number;
  /** 검증에서 열리지 않은 사진 (출력 전에 걸러낸다) */
  broken?: boolean;
}

interface EnrichedFacility {
  slug: string;
  name: string;
  website: string | null;
  phone: string | null;
  address: string | null;
  standardRoomPrice: number | null;
  specialRoomPrice: number | null;
  priceNote: string | null;
  priceSourceUrl: string | null;
  images: VerifiedImage[];
}

const str = (v: unknown): string | null => (typeof v === 'string' && v.trim() !== '' ? v.trim().replace(/\s+/g, ' ') : null);

function httpUrl(v: unknown): string | null {
  const s = str(v);
  if (!s || !/^https?:\/\//i.test(s)) return null;
  try {
    const u = new URL(s);
    return u.hostname.includes('.') ? u.toString() : null;
  } catch {
    return null;
  }
}

/** example.co.kr / www.example.co.kr → example.co.kr (2단계 국가 도메인 고려) */
function registrableDomain(host: string): string {
  const parts = host
    .toLowerCase()
    .replace(/^www\./, '')
    .split('.');
  const twoLevelTld = /^(co|or|ne|go|re|pe|kr|com|net)$/;
  if (parts.length >= 3 && twoLevelTld.test(parts[parts.length - 2])) return parts.slice(-3).join('.');
  return parts.slice(-2).join('.');
}

function phone(v: unknown): string | null {
  const s = str(v);
  if (!s) return null;
  const digits = s.replace(/[^\d]/g, '');
  if (digits.length < 9 || digits.length > 11) return null;
  return s.replace(/[^\d-]/g, '');
}

function price(v: unknown): number | null {
  if (typeof v !== 'number' || !Number.isFinite(v)) return null;
  const n = Math.round(v);
  return n >= MIN_PRICE && n <= MAX_PRICE ? n : null;
}

/** PNG/JPEG/WebP 헤더에서 픽셀 크기를 읽는다. 못 읽으면 null */
export function readImageSize(buf: Buffer): { width: number; height: number } | null {
  if (buf.length > 24 && buf.readUInt32BE(0) === 0x89504e47) return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  if (buf.length > 30 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') {
    const chunk = buf.toString('ascii', 12, 16);
    if (chunk === 'VP8 ') return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
    if (chunk === 'VP8L') {
      const bits = buf.readUInt32LE(21);
      return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
    }
    if (chunk === 'VP8X') return { width: (buf.readUIntLE(24, 3) & 0xffffff) + 1, height: (buf.readUIntLE(27, 3) & 0xffffff) + 1 };
  }
  if (buf.length > 4 && buf.readUInt16BE(0) === 0xffd8) {
    let i = 2;
    while (i + 9 < buf.length) {
      if (buf[i] !== 0xff) {
        i += 1;
        continue;
      }
      const marker = buf[i + 1];
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) return { width: buf.readUInt16BE(i + 7), height: buf.readUInt16BE(i + 5) };
      if (marker === 0xd8 || (marker >= 0xd0 && marker <= 0xd9)) {
        i += 2;
        continue;
      }
      i += 2 + buf.readUInt16BE(i + 2);
    }
  }
  return null;
}

/** 실제로 열리는 사진인지 확인하고 크기를 돌려준다. 너무 작거나(아이콘) 못 읽으면 null */
async function probeImage(url: string): Promise<{ width: number; height: number } | null> {
  try {
    const res = await fetch(url, { method: 'GET', headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'image/*' }, signal: AbortSignal.timeout(15_000) });
    if (!res.ok) return null;
    if (!(res.headers.get('content-type') ?? '').startsWith('image/')) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.byteLength < 3_000) return null; // 1x1 투명 이미지·에러 페이지
    const size = readImageSize(buf);
    if (!size || size.width < MIN_IMAGE_WIDTH || size.height < MIN_IMAGE_HEIGHT) return null;
    return size;
  } catch {
    return null;
  }
}

const q = (s: string) => `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
const qn = (s: string | null) => (s === null ? 'null' : q(s));

/** 수집 파일 → 검증 통과한 보강 데이터 (이미지 크기는 아직 0) */
function readCollected(dir: string, stats: Stats, droppedHosts: Map<string, number>): EnrichedFacility[] {
  const knownSlugs = new Map(SALPYEO_POST_FACILITY_RECORDS.map(r => [postFacilitySlug(r), r]));
  const files = readdirSync(dir).filter(f => f.endsWith('.json'));
  stats.files = files.length;
  const result: EnrichedFacility[] = [];

  for (const file of files.sort()) {
    const raw = JSON.parse(readFileSync(join(dir, file), 'utf-8')) as Collected;
    const slug = str(raw.slug) ?? file.replace(/\.json$/, '');
    const record = knownSlugs.get(slug);
    if (!record) {
      stats.unknownSlug += 1;
      console.warn(`  ! 공공데이터에 없는 slug 무시: ${slug} (${file})`);
      continue;
    }

    const website = httpUrl(raw.website);
    const websiteDomain = website ? registrableDomain(new URL(website).hostname) : null;

    const images: VerifiedImage[] = [];
    if (Array.isArray(raw.images)) {
      for (const item of raw.images as CollectedImage[]) {
        if (images.length >= MAX_IMAGES) break;
        const url = httpUrl(item?.url);
        if (!url || !IMAGE_EXT.test(url)) {
          stats.imagesDropped += 1;
          continue;
        }
        // 공식 홈페이지 도메인(또는 그 홈페이지가 쓰는 빌더 CDN)의 파일만 — 검색결과·블로그 이미지 유입 차단
        const imageHost = new URL(url).hostname.toLowerCase();
        const fromOfficial = Boolean(websiteDomain) && registrableDomain(imageHost) === websiteDomain;
        const fromKnownCdn = IMAGE_CDN_SUFFIXES.some(suffix => imageHost === suffix || imageHost.endsWith(`.${suffix}`));
        if (!websiteDomain || !(fromOfficial || fromKnownCdn)) {
          stats.imagesDropped += 1;
          droppedHosts.set(imageHost, (droppedHosts.get(imageHost) ?? 0) + 1);
          continue;
        }
        if (images.some(i => i.url === url)) continue;
        images.push({ url, alt: str(item?.alt) ?? '시설 사진', sourceUrl: httpUrl(item?.sourceUrl), width: 0, height: 0 });
      }
    }

    // 공공데이터와 값이 같으면 보강할 게 없으므로 null
    const collectedPhone = phone(raw.phone);
    const collectedAddress = str(raw.address);
    const enriched: EnrichedFacility = {
      slug,
      name: record.name,
      website,
      phone: collectedPhone && collectedPhone !== record.phone ? collectedPhone : null,
      address: collectedAddress && collectedAddress !== record.address ? collectedAddress : null,
      standardRoomPrice: price(raw.standardRoomPrice),
      specialRoomPrice: price(raw.specialRoomPrice),
      priceNote: str(raw.priceNote),
      priceSourceUrl: httpUrl(raw.priceSourceUrl),
      images,
    };
    const hasAnything = enriched.website || enriched.phone || enriched.address || enriched.standardRoomPrice || enriched.specialRoomPrice || images.length > 0;
    if (!hasAnything) continue;

    stats.kept += 1;
    if (enriched.website) stats.withWebsite += 1;
    if (enriched.phone) stats.withPhone += 1;
    if (enriched.address) stats.withAddress += 1;
    if (enriched.standardRoomPrice ?? enriched.specialRoomPrice) stats.withPrice += 1;
    result.push(enriched);
  }
  return result;
}

/** 모든 사진을 동시에 여러 개씩 받아 열리는지 확인하고 크기를 채운다 */
async function verifyAllImages(facilities: EnrichedFacility[], stats: Stats): Promise<void> {
  const all = facilities.flatMap(f => f.images);
  console.log(`이미지 ${all.length}장 검증 중 (동시 ${VERIFY_CONCURRENCY})...`);
  let cursor = 0;
  let done = 0;
  await Promise.all(
    Array.from({ length: VERIFY_CONCURRENCY }, async () => {
      for (;;) {
        const index = cursor++;
        if (index >= all.length) return;
        const image = all[index];
        const size = await probeImage(image.url);
        if (size) {
          image.width = size.width;
          image.height = size.height;
        } else {
          image.broken = true;
        }
        done += 1;
        if (done % 100 === 0) console.log(`  ${done}/${all.length}`);
      }
    }),
  );
  for (const f of facilities) {
    const before = f.images.length;
    f.images = f.images.filter(i => !i.broken);
    stats.imagesDropped += before - f.images.length;
  }
}

interface Stats {
  files: number;
  unknownSlug: number;
  kept: number;
  imagesDropped: number;
  withPhone: number;
  withAddress: number;
  withPrice: number;
  withWebsite: number;
}

function render(facilities: EnrichedFacility[]): string {
  const entries = facilities.map(f => {
    const imageLines = f.images
      .map(i => `      { url: ${q(i.url)}, alt: ${q(i.alt)}, width: ${i.width}, height: ${i.height}, sourceUrl: ${qn(i.sourceUrl)} },`)
      .join('\n');
    return [
      `  {`,
      `    slug: ${q(f.slug)},`,
      `    name: ${q(f.name)},`,
      `    website: ${qn(f.website)},`,
      `    phone: ${qn(f.phone)},`,
      `    address: ${qn(f.address)},`,
      `    standardRoomPrice: ${f.standardRoomPrice ?? 'null'},`,
      `    specialRoomPrice: ${f.specialRoomPrice ?? 'null'},`,
      `    priceNote: ${qn(f.priceNote)},`,
      `    priceSourceUrl: ${qn(f.priceSourceUrl)},`,
      f.images.length === 0 ? `    images: [],` : `    images: [\n${imageLines}\n    ],`,
      `  },`,
    ].join('\n');
  });

  return `/**
 * 자동 생성 파일 — 손으로 수정하지 말 것.
 * 각 산후조리원 **공식 홈페이지**에서 수집한 보강 데이터 (사진·요금·연락처·주소).
 * 공공데이터(보건복지부 현황)와 값이 다르면 이 파일이 우선한다. 같은 값은 담지 않는다.
 * 재생성: npx ts-node -r tsconfig-paths/register src/salpyeo/scripts/import-post-facility-enrichment.ts <수집 디렉터리> --verify-images
 */

export interface SalpyeoPostFacilityEnrichmentImage {
  url: string;
  /** 한국어 캡션 겸 대체 텍스트 (예: 스위트룸) */
  alt: string;
  /** 실제 파일에서 읽은 픽셀 크기. 0 = 미상 */
  width: number;
  height: number;
  /** 사진이 실려 있던 페이지 */
  sourceUrl: string | null;
}

export interface SalpyeoPostFacilityEnrichment {
  slug: string;
  /** 대조용 이름 (공공데이터 기준) */
  name: string;
  /** 공식 홈페이지 */
  website: string | null;
  /** 공공데이터와 다를 때만 채운다 */
  phone: string | null;
  address: string | null;
  /** 홈페이지에 2주 총액이 명시된 경우만 (원) */
  standardRoomPrice: number | null;
  specialRoomPrice: number | null;
  priceNote: string | null;
  priceSourceUrl: string | null;
  images: SalpyeoPostFacilityEnrichmentImage[];
}

// prettier-ignore
export const SALPYEO_POST_FACILITY_ENRICHMENTS: readonly SalpyeoPostFacilityEnrichment[] = [
${entries.join('\n')}
];
`;
}

async function main() {
  const [dir, ...flags] = process.argv.slice(2);
  if (!dir) {
    console.error('사용법: import-post-facility-enrichment.ts <수집 디렉터리> [--verify-images]');
    process.exit(1);
  }
  const stats: Stats = { files: 0, unknownSlug: 0, kept: 0, imagesDropped: 0, withPhone: 0, withAddress: 0, withPrice: 0, withWebsite: 0 };
  const droppedHosts = new Map<string, number>();

  const facilities = readCollected(dir, stats, droppedHosts);
  if (flags.includes('--verify-images')) await verifyAllImages(facilities, stats);

  writeFileSync(OUTPUT, render(facilities));
  const images = facilities.reduce((n, f) => n + f.images.length, 0);
  console.log(
    `수집 파일 ${stats.files}건 → 보강 ${stats.kept}건 (홈페이지 ${stats.withWebsite} · 사진 ${images}장 · 전화 ${stats.withPhone} · 주소 ${stats.withAddress} · 요금 ${stats.withPrice}), 버린 이미지 ${stats.imagesDropped}장, 미상 slug ${stats.unknownSlug}건`,
  );
  console.log(`→ ${OUTPUT}`);
  const topDropped = [...droppedHosts].sort((a, b) => b[1] - a[1]).slice(0, 15);
  if (topDropped.length > 0) console.log(`  호스트 규칙으로 버린 이미지: ${topDropped.map(([h, n]) => `${h}(${n})`).join(', ')}`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
