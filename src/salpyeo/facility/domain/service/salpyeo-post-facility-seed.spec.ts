import { SALPYEO_POST_FACILITY_RECORDS } from '@/salpyeo/facility/domain/constant/salpyeo-post-facility-data.constant';
import { buildPostFacilitySeed, formatWon, postFacilitySlug } from './salpyeo-post-facility-seed';

/**
 * 스펙 (기대값은 원본 CSV 에서 파이썬으로 따로 계산한 리터럴):
 * 1) 2023-12-31 현황 456건 전부 post 버티컬, slug 는 중복 없음, sortOrder 는 원본 순번
 * 2) 올리비움(서울 종로구, 1번): slug post-a9656bde, 일반실 470만 → price 4,700,000, 특실 2,000만원, 서울 평균(432.59만) 대비 +9%
 * 3) 공공데이터에 없는 값은 빈 값: distance ''/0, inspectionBadge '', rating 0, reviewCount 0, images [], inspections [], review null
 * 4) 지자체 운영(울산북구공공, 226.8만) → featureBadge '지자체 운영', price 2,268,000, 표시 '226만 8,000원'
 * 5) 일반실 미공개(로얄사임당 봉천) → price 0, priceRows 는 특실만, vsAvgPercent 0
 * 6) 서귀포공공(154만) 은 제주 평균 대비 -50%, 빛고을(294만) 은 광주 평균 대비 -21%
 * 7) 같은 시도·시군구·이름이면 slug 가 같고, 이름이 다르면 다르다
 */
describe('buildPostFacilitySeed', () => {
  const seed = buildPostFacilitySeed(SALPYEO_POST_FACILITY_RECORDS);
  const bySlug = (slug: string) => seed.find(s => s.slug === slug)!;
  const byName = (name: string) => seed.find(s => s.name === name)!;

  it('456건 전부 post, slug 중복 없음, sortOrder 는 원본 순번', () => {
    expect(seed).toHaveLength(456);
    expect(seed.every(s => s.vertical === 'post')).toBe(true);
    expect(new Set(seed.map(s => s.slug)).size).toBe(456);
    expect(seed[0].sortOrder).toBe(1);
    expect(seed[455].sortOrder).toBe(456);
  });

  it('올리비움: 공개 요금·주소·연락처·평균 대비', () => {
    expect(bySlug('post-a9656bde')).toEqual({
      slug: 'post-a9656bde',
      vertical: 'post',
      name: '올리비움산후조리원',
      meta: '서울 종로구',
      sido: '서울',
      sigungu: '종로구',
      operatorType: '민간',
      address: '서울시 종로구 통일로 16길 4-1',
      phone: '02-730-1717',
      distanceLabel: '',
      distanceMinutes: 0,
      inspectionBadge: '',
      featureBadge: '민간 운영',
      price: 4700000,
      rating: 0,
      reviewCount: 0,
      vsAvgPercent: 9,
      images: [],
      priceRows: [
        { room: '일반실', note: '2주 기준 · 2023.12.31 공개 요금', price: '470만원' },
        { room: '특실', note: '2주 기준 · 2023.12.31 공개 요금', price: '2,000만원' },
      ],
      inspections: [],
      review: null,
      sortOrder: 1,
    });
  });

  it('지자체 운영 시설은 배지로 구분하고 소수점 요금도 원 단위로 보존한다', () => {
    const f = byName('울산북구공공산후조리원');
    expect(f.featureBadge).toBe('지자체 운영');
    expect(f.price).toBe(2268000);
    expect(f.priceRows).toEqual([{ room: '일반실', note: '2주 기준 · 2023.12.31 공개 요금', price: '226만 8,000원' }]);
  });

  it('일반실 미공개면 price 0, 특실 행만 남기고 평균 대비는 0', () => {
    const f = byName('로얄사임당산후조리원(봉천)');
    expect(f.price).toBe(0);
    expect(f.priceRows).toEqual([{ room: '특실', note: '2주 기준 · 2023.12.31 공개 요금', price: '470만원' }]);
    expect(f.vsAvgPercent).toBe(0);
    expect(seed.filter(s => s.price === 0)).toHaveLength(7);
  });

  it('평균 대비는 같은 시도 안 일반실 평균으로 계산한다', () => {
    expect(byName('서귀포공공산후조리원').vsAvgPercent).toBe(-50);
    expect(byName('빛고을산후조리원').vsAvgPercent).toBe(-21);
  });

  it('slug 는 시도·시군구·이름으로 결정된다', () => {
    expect(postFacilitySlug({ sido: '서울', sigungu: '종로구', name: '올리비움산후조리원' })).toBe('post-a9656bde');
    expect(postFacilitySlug({ sido: '서울', sigungu: '종로구', name: '다른조리원' })).not.toBe('post-a9656bde');
    expect(() => buildPostFacilitySeed([SALPYEO_POST_FACILITY_RECORDS[0], SALPYEO_POST_FACILITY_RECORDS[0]])).toThrow('slug 충돌');
  });

  it('formatWon 표시 규칙', () => {
    expect(formatWon(4700000)).toBe('470만원');
    expect(formatWon(20000000)).toBe('2,000만원');
    expect(formatWon(2268000)).toBe('226만 8,000원');
    expect(formatWon(0)).toBe('0원');
  });
});
