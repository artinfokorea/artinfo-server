import { SalpyeoFacility } from '@/salpyeo/facility/domain/entity/salpyeo-facility.entity';

export const SALPYEO_FACILITY_SORTS = ['priceAsc', 'ratingDesc', 'reviewsDesc', 'distanceAsc'] as const;
export type SalpyeoFacilitySort = (typeof SALPYEO_FACILITY_SORTS)[number];

const COMPARATORS: Record<SalpyeoFacilitySort, (a: SalpyeoFacility, b: SalpyeoFacility) => number> = {
  priceAsc: (a, b) => a.price - b.price,
  ratingDesc: (a, b) => b.rating - a.rating,
  reviewsDesc: (a, b) => b.reviewCount - a.reviewCount,
  distanceAsc: (a, b) => a.distanceMinutes - b.distanceMinutes,
};

/**
 * 시설 목록 검색·정렬 — 순수 함수라 DB 없이 테스트한다.
 * 한 지역의 시설 수는 수십 개 수준이라 메모리 정렬로 충분하다. 전국 확장 시 repository 쿼리로 내린다.
 */
export function filterFacilitiesByKeyword(items: SalpyeoFacility[], keyword?: string | null): SalpyeoFacility[] {
  const q = keyword?.trim().toLowerCase();
  if (!q) return items;
  return items.filter(f => f.name.toLowerCase().includes(q) || f.meta.toLowerCase().includes(q));
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
