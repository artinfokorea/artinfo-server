import { SalpyeoFacility } from '@/salpyeo/facility/domain/entity/salpyeo-facility.entity';

export const SALPYEO_FACILITY_SORTS = ['priceAsc', 'ratingDesc', 'reviewsDesc', 'distanceAsc'] as const;
export type SalpyeoFacilitySort = (typeof SALPYEO_FACILITY_SORTS)[number];

/** price 0 은 "미공개" — 낮은순에서 맨 뒤로 보낸다 */
const priceOrUnknown = (f: SalpyeoFacility) => (f.price > 0 ? f.price : Number.MAX_SAFE_INTEGER);

const COMPARATORS: Record<SalpyeoFacilitySort, (a: SalpyeoFacility, b: SalpyeoFacility) => number> = {
  priceAsc: (a, b) => priceOrUnknown(a) - priceOrUnknown(b),
  ratingDesc: (a, b) => b.rating - a.rating,
  reviewsDesc: (a, b) => b.reviewCount - a.reviewCount,
  distanceAsc: (a, b) => a.distanceMinutes - b.distanceMinutes,
};

/**
 * 시설 목록 검색·정렬 — 순수 함수라 DB 없이 테스트한다.
 * 전국 산후조리원이 456건이라 메모리 처리로 충분하다. 수천 건 규모가 되면 repository 쿼리 + pagination 으로 내린다.
 */
export function filterFacilitiesByKeyword(items: SalpyeoFacility[], keyword?: string | null): SalpyeoFacility[] {
  const q = keyword?.trim().toLowerCase();
  if (!q) return items;
  // 이름 · 위치 요약(시도 시군구) · 주소 부분 일치 (예: "종로구", "정자")
  return items.filter(f => [f.name, f.meta, f.address ?? ''].some(v => v.toLowerCase().includes(q)));
}

export function filterFacilitiesBySlugs(items: SalpyeoFacility[], slugs?: string[] | null): SalpyeoFacility[] {
  if (!slugs || slugs.length === 0) return items;
  const wanted = new Set(slugs);
  return items.filter(f => wanted.has(f.slug));
}

export function sortFacilities(items: SalpyeoFacility[], sort: SalpyeoFacilitySort = 'priceAsc'): SalpyeoFacility[] {
  const compare = COMPARATORS[sort];
  // 동률이면 sort_order 로 안정 정렬
  return [...items].sort((a, b) => compare(a, b) || a.sortOrder - b.sortOrder);
}
