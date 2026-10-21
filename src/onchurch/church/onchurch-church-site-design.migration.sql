-- onchurch_churches 에 공개 홈페이지 디자인 설정(site_design) 컬럼 추가
-- { colors: { main, point } | null, sections: { [섹션키]: 'default' | 'modern' } } 형태의 jsonb.
-- null 이면 미설정 — 프론트가 site_template(기본/모던) 기준으로 렌더한다.
-- 변경은 교회 관리자 화면(디자인)에서 PUT /onchurch/churches/me/site-design 으로.
-- synchronize:false 이므로 운영 DB에 직접 실행한다.
ALTER TABLE onchurch_churches
  ADD COLUMN IF NOT EXISTS site_design jsonb;
