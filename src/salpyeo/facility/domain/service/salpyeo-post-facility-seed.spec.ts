import { SALPYEO_POST_FACILITY_RECORDS } from '@/salpyeo/facility/domain/constant/salpyeo-post-facility-data.constant';
import { SALPYEO_POST_FACILITY_ENRICHMENTS, SalpyeoPostFacilityEnrichment } from '@/salpyeo/facility/domain/constant/salpyeo-post-facility-enrichment.constant';
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
 * 8) 공식 홈페이지 보강이 있으면 전화·주소·요금은 홈페이지 값이 이기고, 사진과 website 가 채워진다
 * 9) 홈페이지 요금이 하나라도 있으면 요금표는 홈페이지 기준으로만 만든다 (두 출처를 섞지 않는다)
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
      website: '',
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

  it('공식 홈페이지 보강이 공공데이터를 덮어쓴다', () => {
    const enrichment: SalpyeoPostFacilityEnrichment = {
      slug: 'post-a9656bde',
      name: '올리비움산후조리원',
      website: 'https://www.olivium.co.kr/',
      phone: '02-730-1719',
      address: '서울특별시 종로구 통일로16길 4-1',
      standardRoomPrice: 5000000,
      specialRoomPrice: null,
      priceNote: '홈페이지 기준 2주 로열 500만원',
      priceSourceUrl: 'https://www.olivium.co.kr/sub8.php',
      images: [
        { url: 'https://www.olivium.co.kr/common/img/royal_1.jpg', alt: '로열룸', width: 1200, height: 800, sourceUrl: 'https://www.olivium.co.kr/sub8.php' },
      ],
    };
    const [f] = buildPostFacilitySeed([SALPYEO_POST_FACILITY_RECORDS[0]], [enrichment]);
    expect(f).toMatchObject({
      website: 'https://www.olivium.co.kr/',
      phone: '02-730-1719',
      address: '서울특별시 종로구 통일로16길 4-1',
      price: 5000000,
      images: [{ url: 'https://www.olivium.co.kr/common/img/royal_1.jpg', alt: '로열룸', width: 1200, height: 800 }],
      // 홈페이지에 특실 값이 없으므로 공공데이터의 특실 2,000만원은 섞지 않는다
      priceRows: [{ room: '일반실', note: '2주 기준 · 공식 홈페이지 공개 요금', price: '500만원' }],
    });
  });

  it('보강이 없는 시설은 공공데이터 그대로다', () => {
    const [f] = buildPostFacilitySeed([SALPYEO_POST_FACILITY_RECORDS[0]], []);
    expect(f).toMatchObject({ website: '', phone: '02-730-1717', price: 4700000, images: [] });
    expect(f.priceRows[0].note).toBe('2주 기준 · 2023.12.31 공개 요금');
  });

  it('보강 상수의 slug 는 모두 공공데이터에 있는 시설이다', () => {
    const known = new Set(SALPYEO_POST_FACILITY_RECORDS.map(r => postFacilitySlug(r)));
    expect(SALPYEO_POST_FACILITY_ENRICHMENTS.filter(e => !known.has(e.slug))).toEqual([]);
  });

  it('formatWon 표시 규칙', () => {
    expect(formatWon(4700000)).toBe('470만원');
    expect(formatWon(20000000)).toBe('2,000만원');
    expect(formatWon(2268000)).toBe('226만 8,000원');
    expect(formatWon(0)).toBe('0원');
  });
});
