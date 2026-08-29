-- 이미 어긋난 사진 카운터 복구 (탈퇴로 댓글·좋아요가 지워졌지만 카운터가 안 줄어든 케이스) — 운영 DB 에 1회 수동 실행
UPDATE ongi_photos p
   SET comment_count = (SELECT COUNT(*) FROM ongi_photo_comments c WHERE c.photo_id = p.id AND c.deleted_at IS NULL),
       like_count    = (SELECT COUNT(*) FROM ongi_photo_likes l WHERE l.photo_id = p.id)
 WHERE p.deleted_at IS NULL;
