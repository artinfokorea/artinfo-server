import { churchKey, normalizeChurchName, normalizeRegion, regionOfAddress } from '@/holy365/social/domain/holy365-church-name';

describe('normalizeChurchName — 같은 교회인지 비교할 이름', () => {
  it('띄어쓰기와 끝의 "교회" 를 걷는다', () => {
    expect(normalizeChurchName('사랑의 교회')).toBe('사랑의');
    expect(normalizeChurchName('사랑의교회')).toBe('사랑의');
    expect(normalizeChurchName('온누리')).toBe('온누리');
  });

  it('괄호 속 교단·설명은 뺀다', () => {
    expect(normalizeChurchName('명성교회 (대한예수교장로회 통합)')).toBe('명성');
    expect(normalizeChurchName('[기감] 광림교회')).toBe('광림');
  });

  it('영어 Church 와 대소문자', () => {
    expect(normalizeChurchName('Grace Community Church')).toBe('gracecommunity');
    expect(normalizeChurchName('grace community')).toBe('gracecommunity');
  });

  it('"교회" 만 남는 이름은 그대로 둔다', () => {
    expect(normalizeChurchName('교회')).toBe('교회');
  });
});

describe('normalizeRegion — 시/도 이름 통일 + 앞 두 단어', () => {
  it('특별시·광역시·도 를 줄인다', () => {
    expect(normalizeRegion('서울특별시 서초구')).toBe('서울 서초구');
    expect(normalizeRegion('경기도 성남시 분당구')).toBe('경기 성남시');
    expect(normalizeRegion('부산광역시 해운대구')).toBe('부산 해운대구');
    expect(normalizeRegion('세종특별자치시')).toBe('세종');
    expect(normalizeRegion('강원특별자치도 춘천시')).toBe('강원 춘천시');
  });

  it('해외 주소는 앞뒤 공백·대소문자만 정리', () => {
    expect(normalizeRegion('  Los Angeles,  CA ')).toBe('los angeles, ca');
  });
});

describe('regionOfAddress — 카카오 주소에서 지역', () => {
  it('시/도 + 시/군/구', () => {
    expect(regionOfAddress('서울 서초구 반포대로 1')).toBe('서울 서초구');
  });
});

describe('churchKey — 이름 + 지역이 같으면 같은 교회', () => {
  it('표기가 달라도 같은 키', () => {
    expect(churchKey('사랑의 교회 (예장합동)', '서울특별시 서초구')).toBe(churchKey('사랑의교회', '서울 서초구'));
  });

  it('지역이 다르면 다른 키', () => {
    expect(churchKey('사랑의교회', '서울 서초구')).not.toBe(churchKey('사랑의교회', '부산 해운대구'));
  });
});
