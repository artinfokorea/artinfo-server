import { createHash } from 'crypto';
import type { SalpyeoFacilitySeed } from '@/salpyeo/facility/domain/constant/salpyeo-facility-seed.constant';
import { SalpyeoFacilityImage, SalpyeoPriceRow } from '@/salpyeo/facility/domain/entity/salpyeo-facility.entity';
import { SALPYEO_POST_FACILITY_DATA_SOURCE, SalpyeoPostFacilityRecord } from '@/salpyeo/facility/domain/constant/salpyeo-post-facility-data.constant';
import { SalpyeoPostFacilityEnrichment } from '@/salpyeo/facility/domain/constant/salpyeo-post-facility-enrichment.constant';

/**
 * 보건복지부 산후조리원 현황(공공데이터) + 조리원 공식 홈페이지 보강 → 살펴 시설 시드. 순수 함수라 DB 없이 테스트한다.
 *
 * 두 자료가 다르면 **공식 홈페이지가 우선** (전화·주소·요금). 홈페이지에 없으면 공공데이터 값을 쓴다.
 * 어느 쪽에도 없는 값은 지어내지 않고 빈 값으로 둔다:
 * - distance: label '' / minutes 0  (사용자 위치 미정 — 클라이언트는 빈 값이면 숨김)
 * - inspectionBadge '' / inspections []  (보건소 점검 결과는 별도 데이터 연동 예정)
 * - rating 0 / reviewCount 0 / review null
 * - images: 공식 홈페이지 사진만. 못 찾았으면 []
 * - price: 2주 일반실 요금. 미공개면 0 (클라이언트 "가격 공개 시설만" 필터 기준)
 * - vsAvgPercent: 같은 시도 안 일반실 평균 대비 % (표시되는 요금 그대로 계산)
 */
export function buildPostFacilitySeed(
  records: readonly SalpyeoPostFacilityRecord[],
  enrichments: readonly SalpyeoPostFacilityEnrichment[] = [],
): SalpyeoFacilitySeed[] {
  const enrichmentBySlug = new Map(enrichments.map(e => [e.slug, e]));
  const merged = records.map(r => mergeRecord(r, enrichmentBySlug.get(postFacilitySlug(r))));
  const averageBySido = standardRoomAverageBySido(merged);
  const seen = new Set<string>();

  return merged.map(m => {
    if (seen.has(m.slug)) throw new Error(`산후조리원 slug 충돌: ${m.slug} (${m.sido} ${m.sigungu} ${m.name})`);
    seen.add(m.slug);

    const average = averageBySido.get(m.sido);
    const vsAvgPercent = m.standardRoomPrice !== null && average ? Math.round(((m.standardRoomPrice - average) / average) * 100) : 0;

    return {
      slug: m.slug,
      vertical: 'post',
      name: m.name,
      meta: `${m.sido} ${m.sigungu}`,
      sido: m.sido,
      sigungu: m.sigungu,
      operatorType: m.operator,
      address: m.address,
      phone: m.phone,
      website: m.website,
      distanceLabel: '',
      distanceMinutes: 0,
      inspectionBadge: '',
      featureBadge: m.operator === '지자체' ? '지자체 운영' : '민간 운영',
      price: m.standardRoomPrice ?? 0,
      rating: 0,
      reviewCount: 0,
      vsAvgPercent,
      images: m.images,
      priceRows: postPriceRows(m),
      inspections: [],
      review: null,
      sortOrder: m.no,
    };
  });
}

/** 공공데이터 한 건 + 홈페이지 보강 → 표시할 값 하나로 합친 중간 형태 */
interface MergedPostFacility {
  slug: string;
  no: number;
  sido: string;
  sigungu: string;
  operator: '민간' | '지자체';
  name: string;
  address: string;
  phone: string;
  website: string;
  standardRoomPrice: number | null;
  specialRoomPrice: number | null;
  /** 요금 출처 — 표에 함께 적는다 */
  priceFromWebsite: boolean;
  images: SalpyeoFacilityImage[];
}

function mergeRecord(r: SalpyeoPostFacilityRecord, e?: SalpyeoPostFacilityEnrichment): MergedPostFacility {
  // 홈페이지에 일반실·특실 중 하나라도 2주 총액이 있으면 요금은 홈페이지 기준으로 통일한다 (두 출처를 한 표에 섞지 않는다)
  const priceFromWebsite = Boolean(e && (e.standardRoomPrice !== null || e.specialRoomPrice !== null));
  return {
    slug: postFacilitySlug(r),
    no: r.no,
    sido: r.sido,
    sigungu: r.sigungu,
    operator: r.operator,
    name: r.name,
    address: e?.address ?? r.address,
    phone: e?.phone ?? r.phone,
    website: e?.website ?? '',
    standardRoomPrice: priceFromWebsite ? (e?.standardRoomPrice ?? null) : r.standardRoomPrice,
    specialRoomPrice: priceFromWebsite ? (e?.specialRoomPrice ?? null) : r.specialRoomPrice,
    priceFromWebsite,
    images: (e?.images ?? []).map(i => ({ url: i.url, alt: i.alt, width: i.width, height: i.height })),
  };
}

/**
 * URL 식별자 — 시도·시군구·이름의 해시라 데이터 갱신으로 순번이 바뀌어도 같은 시설이면 같은 slug.
 * 같은 시군구 안 동명 시설은 원본에 없다 (충돌 시 build 에서 예외).
 */
export function postFacilitySlug(r: Pick<SalpyeoPostFacilityRecord, 'sido' | 'sigungu' | 'name'>): string {
  return `post-${createHash('sha1').update(`${r.sido}|${r.sigungu}|${r.name}`).digest('hex').slice(0, 8)}`;
}

function standardRoomAverageBySido(items: readonly MergedPostFacility[]): Map<string, number> {
  const sums = new Map<string, { total: number; count: number }>();
  for (const m of items) {
    if (m.standardRoomPrice === null) continue;
    const acc = sums.get(m.sido) ?? { total: 0, count: 0 };
    acc.total += m.standardRoomPrice;
    acc.count += 1;
    sums.set(m.sido, acc);
  }
  return new Map([...sums].map(([sido, { total, count }]) => [sido, total / count]));
}

function postPriceRows(m: MergedPostFacility): SalpyeoPriceRow[] {
  const note = m.priceFromWebsite ? '2주 기준 · 공식 홈페이지 공개 요금' : `2주 기준 · ${SALPYEO_POST_FACILITY_DATA_SOURCE.asOf.replace(/-/g, '.')} 공개 요금`;
  const rows: SalpyeoPriceRow[] = [];
  if (m.standardRoomPrice !== null) rows.push({ room: '일반실', note, price: formatWon(m.standardRoomPrice) });
  if (m.specialRoomPrice !== null) rows.push({ room: '특실', note, price: formatWon(m.specialRoomPrice) });
  return rows;
}

/** 원 단위 → "470만원" / "226만 8,000원" (클라이언트 formatWon 과 동일 규칙) */
export function formatWon(amount: number): string {
  if (amount === 0) return '0원';
  const man = Math.floor(amount / 10_000);
  const rest = amount % 10_000;
  if (rest === 0) return `${man.toLocaleString('ko-KR')}만원`;
  if (man === 0) return `${rest.toLocaleString('ko-KR')}원`;
  return `${man.toLocaleString('ko-KR')}만 ${rest.toLocaleString('ko-KR')}원`;
}
