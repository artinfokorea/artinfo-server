import { createHash } from 'crypto';
import type { SalpyeoFacilitySeed } from '@/salpyeo/facility/domain/constant/salpyeo-facility-seed.constant';
import { SalpyeoPriceRow } from '@/salpyeo/facility/domain/entity/salpyeo-facility.entity';
import { SALPYEO_POST_FACILITY_DATA_SOURCE, SalpyeoPostFacilityRecord } from '@/salpyeo/facility/domain/constant/salpyeo-post-facility-data.constant';

/**
 * 보건복지부 산후조리원 현황(공공데이터) 레코드 → 살펴 시설 시드 변환. 순수 함수라 DB 없이 테스트한다.
 *
 * 공공데이터에 없는 값(거리·점검·평점·후기·사진)은 지어내지 않고 빈 값으로 둔다:
 * - distance: label '' / minutes 0  (사용자 위치 미정 — 클라이언트는 빈 값이면 숨김)
 * - inspectionBadge '' / inspections []  (보건소 점검 결과는 별도 데이터 연동 예정)
 * - rating 0 / reviewCount 0 / review null / images []
 * - price: 2주 일반실 요금. 미공개면 0 (클라이언트 "가격 공개 시설만" 필터 기준)
 * - vsAvgPercent: 같은 시도 안 일반실 평균 대비 % (실제 공개 요금으로 계산)
 */
export function buildPostFacilitySeed(records: readonly SalpyeoPostFacilityRecord[]): SalpyeoFacilitySeed[] {
  const averageBySido = standardRoomAverageBySido(records);
  const seen = new Set<string>();

  return records.map(r => {
    const slug = postFacilitySlug(r);
    if (seen.has(slug)) throw new Error(`산후조리원 slug 충돌: ${slug} (${r.sido} ${r.sigungu} ${r.name})`);
    seen.add(slug);

    const price = r.standardRoomPrice ?? 0;
    const average = averageBySido.get(r.sido);
    const vsAvgPercent = r.standardRoomPrice !== null && average ? Math.round(((r.standardRoomPrice - average) / average) * 100) : 0;

    return {
      slug,
      vertical: 'post',
      name: r.name,
      meta: `${r.sido} ${r.sigungu}`,
      sido: r.sido,
      sigungu: r.sigungu,
      operatorType: r.operator,
      address: r.address,
      phone: r.phone,
      distanceLabel: '',
      distanceMinutes: 0,
      inspectionBadge: '',
      featureBadge: r.operator === '지자체' ? '지자체 운영' : '민간 운영',
      price,
      rating: 0,
      reviewCount: 0,
      vsAvgPercent,
      images: [],
      priceRows: postPriceRows(r),
      inspections: [],
      review: null,
      sortOrder: r.no,
    };
  });
}

/**
 * URL 식별자 — 시도·시군구·이름의 해시라 데이터 갱신으로 순번이 바뀌어도 같은 시설이면 같은 slug.
 * 같은 시군구 안 동명 시설은 원본에 없다 (충돌 시 build 에서 예외).
 */
export function postFacilitySlug(r: Pick<SalpyeoPostFacilityRecord, 'sido' | 'sigungu' | 'name'>): string {
  return `post-${createHash('sha1').update(`${r.sido}|${r.sigungu}|${r.name}`).digest('hex').slice(0, 8)}`;
}

function standardRoomAverageBySido(records: readonly SalpyeoPostFacilityRecord[]): Map<string, number> {
  const sums = new Map<string, { total: number; count: number }>();
  for (const r of records) {
    if (r.standardRoomPrice === null) continue;
    const acc = sums.get(r.sido) ?? { total: 0, count: 0 };
    acc.total += r.standardRoomPrice;
    acc.count += 1;
    sums.set(r.sido, acc);
  }
  return new Map([...sums].map(([sido, { total, count }]) => [sido, total / count]));
}

function postPriceRows(r: SalpyeoPostFacilityRecord): SalpyeoPriceRow[] {
  const asOf = SALPYEO_POST_FACILITY_DATA_SOURCE.asOf.replace(/-/g, '.');
  const rows: SalpyeoPriceRow[] = [];
  if (r.standardRoomPrice !== null) rows.push({ room: '일반실', note: `2주 기준 · ${asOf} 공개 요금`, price: formatWon(r.standardRoomPrice) });
  if (r.specialRoomPrice !== null) rows.push({ room: '특실', note: `2주 기준 · ${asOf} 공개 요금`, price: formatWon(r.specialRoomPrice) });
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
