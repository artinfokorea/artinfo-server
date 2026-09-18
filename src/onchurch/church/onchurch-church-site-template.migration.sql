-- onchurch_churches 에 공개 홈페이지 템플릿(site_template) 컬럼 추가
-- 공개 홈페이지를 'default'(기본) / 'modern'(카드형) 템플릿으로 렌더한다.
-- ('modern'은 최초 'classic'으로 추가됐다 — onchurch-church-site-template-rename.migration.sql 참고)
-- 템플릿 지정은 교회 관리자 화면(홈화면 구성 > 홈 디자인) 또는 마스터에서 변경한다.
-- synchronize:false 이므로 운영 DB에 직접 실행한다.
ALTER TABLE onchurch_churches
  ADD COLUMN IF NOT EXISTS site_template varchar NOT NULL DEFAULT 'default';
