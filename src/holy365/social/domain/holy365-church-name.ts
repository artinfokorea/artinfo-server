const PROVINCES: [RegExp, string][] = [
  [/^서울(특별시)?$/, '서울'],
  [/^부산(광역시)?$/, '부산'],
  [/^대구(광역시)?$/, '대구'],
  [/^인천(광역시)?$/, '인천'],
  [/^광주(광역시)?$/, '광주'],
  [/^대전(광역시)?$/, '대전'],
  [/^울산(광역시)?$/, '울산'],
  [/^세종(특별자치시)?$/, '세종'],
  [/^경기(도)?$/, '경기'],
  [/^강원(도|특별자치도)?$/, '강원'],
  [/^충(청)?북(도)?$|^충청북도$/, '충북'],
  [/^충(청)?남(도)?$|^충청남도$/, '충남'],
  [/^전(라)?북(도)?$|^전라북도$|^전북특별자치도$/, '전북'],
  [/^전(라)?남(도)?$|^전라남도$/, '전남'],
  [/^경(상)?북(도)?$|^경상북도$/, '경북'],
  [/^경(상)?남(도)?$|^경상남도$/, '경남'],
  [/^제주(도|특별자치도)?$/, '제주'],
];

/**
 * 같은 교회인지 비교할 이름 — 괄호 속 교단·설명, 띄어쓰기, 끝의 "교회"/"church" 를 걷고 소문자로.
 * 화면에는 원래 이름을 그대로 보여준다.
 */
export function normalizeChurchName(name: string): string {
  const cleaned = name
    .normalize('NFC')
    .replace(/\([^)]*\)|\[[^\]]*\]|（[^）]*）/g, ' ')
    .toLowerCase()
    .replace(/\s+/g, '');
  const stripped = cleaned.replace(/(교회|church)$/, '');

  return stripped || cleaned;
}

/** 지역 — 한국 주소는 "시/도 시/군/구" 두 단어로 통일, 해외는 공백·대소문자만 정리 */
export function normalizeRegion(region: string): string {
  const tokens = region.normalize('NFC').trim().split(/\s+/).filter(Boolean);
  if (!tokens.length) return '';

  const province = PROVINCES.find(([pattern]) => pattern.test(tokens[0]));
  if (!province) return tokens.join(' ').toLowerCase();

  return [province[1], tokens[1]].filter(Boolean).join(' ');
}

/** 카카오 장소의 주소("서울 서초구 반포대로 1")에서 지역 */
export function regionOfAddress(address: string): string {
  return normalizeRegion(address.split(/\s+/).slice(0, 2).join(' '));
}

export function churchKey(name: string, region: string): string {
  return `${normalizeChurchName(name)}|${normalizeRegion(region)}`;
}
