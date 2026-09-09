import { SalpyeoFacility } from '@/salpyeo/facility/domain/entity/salpyeo-facility.entity';
import { filterFacilitiesByKeyword, filterFacilitiesBySlugs, sortFacilities } from './salpyeo-facility-query';

/**
 * 스펙 (기대값 — 프론트 목데이터와 동일):
 * 1) 기본 정렬은 가격 낮은순: 라온(480) → 포근(520) → 온새미로(545) → 소풍(610)
 * 2) 평점 높은순: 소풍(4.7) → 라온(4.6) → 포근(4.4) → 온새미로(4.3)
 * 3) 후기 많은순: 라온(128) → 포근(96) → 소풍(74) → 온새미로(61)
 * 4) 가까운순: 라온(8) → 소풍(11) → 온새미로(12) → 포근(14)
 * 5) 키워드 검색은 이름·위치(meta)·주소를 대소문자 무시로 부분 일치, 공백/빈 문자열은 전체 반환
 * 8) 가격 0(미공개) 은 가격 낮은순에서 맨 뒤
 * 6) slugs 필터는 순서와 무관하게 해당 시설만 남김, 없는 slug 는 무시
 * 7) 정렬은 원본 배열을 변경하지 않음
 */
function facility(partial: Partial<SalpyeoFacility>): SalpyeoFacility {
  return Object.assign(new SalpyeoFacility(), { sortOrder: 0, meta: '', address: '', ...partial });
}

const raon = facility({
  slug: 'p1',
  name: '라온 산후조리원',
  meta: '정자역 도보 6분',
  price: 4_800_000,
  rating: 4.6,
  reviewCount: 128,
  distanceMinutes: 8,
  sortOrder: 1,
});
const pogeun = facility({
  slug: 'p2',
  name: '포근 산후조리원',
  meta: '미금역 도보 3분',
  price: 5_200_000,
  rating: 4.4,
  reviewCount: 96,
  distanceMinutes: 14,
  sortOrder: 2,
});
const onsaemiro = facility({
  slug: 'p3',
  name: '온새미로 조리원',
  meta: '서현역 도보 5분',
  price: 5_450_000,
  rating: 4.3,
  reviewCount: 61,
  distanceMinutes: 12,
  sortOrder: 3,
});
const sopung = facility({
  slug: 'p4',
  name: '소풍 산후조리원',
  meta: '수내역 도보 8분',
  price: 6_100_000,
  rating: 4.7,
  reviewCount: 74,
  distanceMinutes: 11,
  sortOrder: 4,
});
const all = [sopung, onsaemiro, pogeun, raon];
const names = (items: SalpyeoFacility[]) => items.map(f => f.name);

describe('sortFacilities', () => {
  it('기본 정렬은 가격 낮은순이다', () => {
    expect(names(sortFacilities(all))).toEqual(['라온 산후조리원', '포근 산후조리원', '온새미로 조리원', '소풍 산후조리원']);
  });

  it('가격 0(미공개) 은 낮은순에서 맨 뒤로 간다', () => {
    const unknown = facility({ name: '미공개 조리원', price: 0, sortOrder: 0 });
    expect(names(sortFacilities([unknown, ...all]))).toEqual(['라온 산후조리원', '포근 산후조리원', '온새미로 조리원', '소풍 산후조리원', '미공개 조리원']);
  });

  it('평점 높은순으로 정렬한다', () => {
    expect(names(sortFacilities(all, 'ratingDesc'))).toEqual(['소풍 산후조리원', '라온 산후조리원', '포근 산후조리원', '온새미로 조리원']);
  });

  it('후기 많은순으로 정렬한다', () => {
    expect(names(sortFacilities(all, 'reviewsDesc'))).toEqual(['라온 산후조리원', '포근 산후조리원', '소풍 산후조리원', '온새미로 조리원']);
  });

  it('가까운순으로 정렬한다', () => {
    expect(names(sortFacilities(all, 'distanceAsc'))).toEqual(['라온 산후조리원', '소풍 산후조리원', '온새미로 조리원', '포근 산후조리원']);
  });

  it('동률이면 sort_order 로 안정 정렬한다', () => {
    const a = facility({ slug: 'a', name: 'A', price: 100, sortOrder: 2 });
    const b = facility({ slug: 'b', name: 'B', price: 100, sortOrder: 1 });
    expect(names(sortFacilities([a, b]))).toEqual(['B', 'A']);
  });

  it('원본 배열을 변경하지 않는다', () => {
    const input = [...all];
    sortFacilities(input);
    expect(names(input)).toEqual(['소풍 산후조리원', '온새미로 조리원', '포근 산후조리원', '라온 산후조리원']);
  });
});

describe('filterFacilitiesByKeyword', () => {
  it('이름 부분 일치로 찾는다', () => {
    expect(names(filterFacilitiesByKeyword(all, '라온'))).toEqual(['라온 산후조리원']);
  });

  it('위치(meta) 로도 찾는다', () => {
    expect(names(filterFacilitiesByKeyword(all, '서현역'))).toEqual(['온새미로 조리원']);
  });

  it('주소로도 찾는다', () => {
    const withAddress = [facility({ name: '디에르', address: '성남시 정자일로 121 2층' }), facility({ name: '라온', address: '서울시 종로구 통일로 16길' })];
    expect(names(filterFacilitiesByKeyword(withAddress, '정자'))).toEqual(['디에르']);
  });

  it('빈 문자열·공백·undefined 는 전체를 반환한다', () => {
    expect(filterFacilitiesByKeyword(all, '')).toHaveLength(4);
    expect(filterFacilitiesByKeyword(all, '   ')).toHaveLength(4);
    expect(filterFacilitiesByKeyword(all, undefined)).toHaveLength(4);
  });

  it('일치하는 시설이 없으면 빈 배열이다', () => {
    expect(filterFacilitiesByKeyword(all, '강남')).toEqual([]);
  });
});

describe('filterFacilitiesBySlugs', () => {
  it('지정한 slug 의 시설만 남긴다 (없는 slug 는 무시)', () => {
    expect(names(filterFacilitiesBySlugs(all, ['p4', 'p1', 'nope']))).toEqual(['소풍 산후조리원', '라온 산후조리원']);
  });

  it('slugs 가 비어 있으면 전체를 반환한다', () => {
    expect(filterFacilitiesBySlugs(all, [])).toHaveLength(4);
    expect(filterFacilitiesBySlugs(all, null)).toHaveLength(4);
  });
});
