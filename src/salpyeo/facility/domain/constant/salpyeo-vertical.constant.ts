/** 살펴가 다루는 5개 버티컬 키 */
export const SALPYEO_VERTICAL_KEYS = ['post', 'nursing', 'funeral', 'daycare', 'academy'] as const;
export type SalpyeoVerticalKey = (typeof SALPYEO_VERTICAL_KEYS)[number];

export function isSalpyeoVerticalKey(value: string): value is SalpyeoVerticalKey {
  return (SALPYEO_VERTICAL_KEYS as readonly string[]).includes(value);
}

export interface SalpyeoVerticalMeta {
  key: SalpyeoVerticalKey;
  /** 탭·카드 라벨 (예: 산후조리원) */
  label: string;
  /** 홈 카드 부제 */
  sub: string;
  /** 가격 기준 문구 — 버티컬마다 다름 (예: 2주 일반실) */
  priceLabel: string;
  /** 데이터 출처 */
  source: string;
  /** false 면 클라이언트에 노출되지만 진입 불가 (준비 중) */
  enabled: boolean;
}

/**
 * 버티컬 메타는 코드 상수로 관리한다 (변경 빈도가 낮고 배포 단위로 바뀌는 값).
 * 시설 수(count)는 DB 집계로 채워 응답한다.
 */
export const SALPYEO_VERTICALS: readonly SalpyeoVerticalMeta[] = [
  { key: 'post', label: '산후조리원', sub: '2주 요금 · 보건소 점검 결과', priceLabel: '2주 일반실', source: '모자보건법 요금 공개', enabled: true },
  {
    key: 'nursing',
    label: '요양원',
    sub: '장기요양 평가등급 · 비급여 식대',
    priceLabel: '월 본인부담 (비급여 포함)',
    source: '건보공단 장기요양기관 평가',
    enabled: false,
  },
  {
    key: 'funeral',
    label: '장례식장',
    sub: 'e하늘 공개 가격 · 빈소 규모',
    priceLabel: '빈소 1일 사용료 (중형)',
    source: 'e하늘 장사정보 가격 공개',
    enabled: false,
  },
  {
    key: 'daycare',
    label: '어린이집·유치원',
    sub: '평가인증 · 입소 대기 현황',
    priceLabel: '월 부담금 (특별활동 포함)',
    source: '아이사랑 · 유치원알리미',
    enabled: false,
  },
  { key: 'academy', label: '학원', sub: '나이스 교습비 공개 · 정원', priceLabel: '월 교습비', source: '나이스 교습비 공개', enabled: false },
];

export function findSalpyeoVertical(key: SalpyeoVerticalKey): SalpyeoVerticalMeta {
  return SALPYEO_VERTICALS.find(v => v.key === key)!;
}
