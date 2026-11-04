-- onchurch_churches 에 마스터 전용 메모 컬럼 추가 (교회·공개 응답에는 노출하지 않는다)
-- synchronize:false 이므로 운영 DB에 직접 실행한다.
ALTER TABLE onchurch_churches
  ADD COLUMN IF NOT EXISTS master_memo text NULL;
