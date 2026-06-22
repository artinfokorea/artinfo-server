-- 소식(공지) 글에 이미지 외 일반 첨부파일(다운로드용)을 보관하는 컬럼 추가.
-- 각 원소: { "url": string, "name": string, "size": number, "mimeType": string }
ALTER TABLE onchurch_notices
  ADD COLUMN IF NOT EXISTS attachments jsonb NOT NULL DEFAULT '[]'::jsonb;
