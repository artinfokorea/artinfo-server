-- synchronize:false 이므로 운영 DB에 직접 실행합니다.
-- 설교 카테고리(series)에 '전체' 보기 특수 카테고리 플래그 추가. (갤러리와 동일 패턴)
ALTER TABLE onchurch_sermon_series ADD COLUMN IF NOT EXISTS is_all BOOLEAN NOT NULL DEFAULT false;

-- 기존 교회들이 공개 말씀 페이지에서 '전체' 칩을 잃지 않도록, is_all 카테고리가 없는 모든 교회에 하나 생성(백필).
INSERT INTO onchurch_sermon_series (church_id, name, sort_order, is_active, is_all, created_at, updated_at)
SELECT c.id, '전체', 0, true, true, now(), now()
FROM onchurch_churches c
WHERE NOT EXISTS (
  SELECT 1 FROM onchurch_sermon_series s WHERE s.church_id = c.id AND s.is_all = true
);
