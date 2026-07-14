-- onchurch_churches 에 공개 홈페이지 템플릿(site_template) 컬럼 추가
-- 공개 홈페이지를 'default'(기본 모던) / 'classic'(충현교회 스타일 전통형) 템플릿으로 렌더한다.
-- 템플릿 지정은 운영자가 DB에서 직접 변경한다(관리자 UI 없음, 일반 저장 경로에서도 건드리지 않음).
-- synchronize:false 이므로 운영 DB에 직접 실행한다.
ALTER TABLE onchurch_churches
  ADD COLUMN IF NOT EXISTS site_template varchar NOT NULL DEFAULT 'default';
