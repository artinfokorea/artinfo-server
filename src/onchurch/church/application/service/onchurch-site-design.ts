// 공개 홈페이지 '디자인 설정' 값 정규화.
//
// 교회 관리자가 섹션별 디자인(기본/모던)과 메인·포인트 색을 고르면 onchurch_churches.site_design(jsonb)에 한 덩어리로 저장한다.
// 저장 형태: { colors: { main, point } | null, sections: { [섹션키]: '디자인ID' } }
//  - colors 가 null 이면 템플릿 기본색 사용.
//  - sections 에 없는 섹션은 프론트가 site_template(기본/모던) 기준으로 폴백한다.
// 섹션 키·디자인 ID 화이트리스트는 두지 않는다 — 지원 목록은 프론트 레지스트리가 단일 소스이며,
// 모르는 값은 프론트에서 폴백되므로 섹션·디자인 추가 시 서버 배포가 필요 없다(site_template 과 같은 원칙).

export type OnchurchSiteDesignColors = { main: string; point: string };

export type OnchurchSiteDesign = {
  colors: OnchurchSiteDesignColors | null;
  sections: Record<string, string>;
};

export class OnchurchSiteDesignError extends Error {}

const HEX_COLOR = /^#[0-9a-f]{6}$/;
const KEY = /^[a-z][a-z0-9-]{0,31}$/;

function normalizeHex(value: unknown, field: string): string {
  if (typeof value !== 'string') throw new OnchurchSiteDesignError(`${field} 색은 #rrggbb 형식이어야 합니다`);
  const v = value.trim().toLowerCase();
  if (!HEX_COLOR.test(v)) throw new OnchurchSiteDesignError(`${field} 색은 #rrggbb 형식이어야 합니다`);
  return v;
}

// 입력이 null 이거나 아무 설정도 없으면 null(미설정)로 저장한다.
export function normalizeSiteDesign(input: unknown): OnchurchSiteDesign | null {
  if (input == null) return null;
  if (typeof input !== 'object' || Array.isArray(input)) throw new OnchurchSiteDesignError('디자인 설정 형식이 올바르지 않습니다');
  const raw = input as { colors?: unknown; sections?: unknown };

  let colors: OnchurchSiteDesignColors | null = null;
  if (raw.colors != null) {
    if (typeof raw.colors !== 'object' || Array.isArray(raw.colors)) throw new OnchurchSiteDesignError('colors 형식이 올바르지 않습니다');
    const c = raw.colors as { main?: unknown; point?: unknown };
    colors = { main: normalizeHex(c.main, '메인'), point: normalizeHex(c.point, '포인트') };
  }

  const sections: Record<string, string> = {};
  if (raw.sections != null) {
    if (typeof raw.sections !== 'object' || Array.isArray(raw.sections)) throw new OnchurchSiteDesignError('sections 형식이 올바르지 않습니다');
    for (const [key, value] of Object.entries(raw.sections as Record<string, unknown>)) {
      if (!KEY.test(key)) throw new OnchurchSiteDesignError(`섹션 키 형식이 올바르지 않습니다: ${key}`);
      if (typeof value !== 'string') throw new OnchurchSiteDesignError(`섹션 디자인 값은 문자열이어야 합니다: ${key}`);
      const v = value.trim().toLowerCase();
      if (!v) continue; // 빈 값 = 그 섹션은 폴백
      if (!KEY.test(v)) throw new OnchurchSiteDesignError(`섹션 디자인 값 형식이 올바르지 않습니다: ${key}`);
      sections[key] = v;
    }
  }

  if (!colors && Object.keys(sections).length === 0) return null;
  return { colors, sections };
}
