# ONGI (온기) — 아키텍처

가족 사진 공유 앱 **온기(ONGI)** 의 백엔드 패키지. 클라이언트는 Expo 앱(`ongi-corp/ongi`)이며, 모든 API 는 `/ongi/*` 전용으로 제공한다 (다른 프로젝트의 API 를 공유하지 않음).

`AZEYO-ARCHITECTURE.md` 의 DDD 구조를 그대로 따른다: `presentation → application → domain ← infrastructure`. 작업 완료 후 구조/규칙 변경이 있으면 이 문서를 업데이트할 것.

## 도메인 모델

- **user** (`ongi_users`) — 계정. SNS 로그인(kakao/naver/google) 기준. `(sns_type, sns_id)` 유니크.
- **auth** (`ongi_auths`) — 발급된 access/refresh 토큰 세션.
- **group** (`ongi_groups`, `ongi_members`) — 가족 공간. 구성원(member)은 사용자 × 그룹 레코드이며 그룹마다 호칭(name)이 다르다. **사진 작성자와 댓글 작성자는 user id 가 아니라 member id** 를 가리킨다.
- **album** (`ongi_albums`) — 커버/부가정보(meta)는 앨범의 최신 사진에서 계산.
- **photo** (`ongi_photos`, `ongi_photo_likes`, `ongi_photo_comments`) — 그룹 피드 게시물. 여러 그룹 동시 업로드 시 그룹마다 독립 레코드가 생겨 좋아요·댓글이 분리된다. 인물 태그 기능은 2026-09-14 제거(`ongi_people`·`person_ids` 삭제) — 응답의 `personIds` 는 구버전 앱 호환용 빈 배열. `like_count`/`comment_count` 는 비정규화 카운터.
- **legal** — 약관·정책 문서 (코드 상수, 테이블 없음, 공개 엔드포인트).
- **chat** (`ongi_chat_rooms`, `ongi_chat_participants`, `ongi_chat_messages`) — 채팅 (2026-09-27). 가족 공간과 **따로 존재**한다: 참여자는 구성원이 아니라 **사용자(user id)**, 공간을 나가거나 공간이 삭제돼도 방·메시지·참여는 그대로. 공간은 방을 만들거나 초대하는 순간에만 확인한다(요청자가 속한 공간의 구성원만 — 여러 공간 사람을 섞을 수 있다).

## 규칙/결정 사항

- 테이블 prefix 는 전부 `ongi_`. DDL 은 각 피처 루트의 `*.ddl.sql` — synchronize:false 이므로 운영 DB 에 수동 실행해야 한다.
- 응답 DTO 의 id 는 전부 **문자열로 변환**해 내려준다 (앱 타입이 string id 기준).
- 집계(photoCount 등)는 모듈 순환 의존을 피하기 위해 각 infrastructure repository 에서 `manager.query` 로 다른 `ongi_*` 테이블을 직접 집계한다.
- 그룹 스코프 API 는 항상 요청자의 membership 을 검증한다 (`OngiNotGroupMember`).
- 초대 코드는 `ONGI-XXXX` (혼동 문자 제외 32자셋), 7일 만료. 만료된 코드는 그룹 상세 조회 시 자동 갱신된다.
- 에러 코드는 `ONGI-{DOMAIN}-{NNN}`.

## 인증

- 로그인: `POST /ongi/auths/login` `{ provider, token?, name? }` — 미가입 시 자동 가입.
  - `token` 이 있으면 provider userinfo API 로 검증 (kakao/naver/google).
  - **개발용 로그인**: `token` 없이 호출하면 `dev-{provider}` 계정으로 로그인된다. 로컬 `.env` 에 `ONGI_DEV_LOGIN=true` 가 있을 때만 허용(기본 차단, 배포 워크플로는 주입하지 않음). 앱은 구글 네이티브 SDK access token / Apple identity token(JWT, 서버가 Apple JWKS 로 직접 검증, aud=`ONGI_APPLE_CLIENT_ID` 기본 `com.ongifamily.app`)으로 로그인한다. Apple 은 이름을 최초 1회만 앱에 주므로 요청 `name` 으로 전달한다.
- 토큰: azeyo/onchurch 와 동일 (access 1시간 / refresh 60일, `POST /ongi/auths/refresh`, Redis 3초 dedupe). access 토큰 payload 는 `{ id, name }` (공용 `jwt.strategy` 가 `payload.name` 을 사용).
- 가드: 공용 `RestApi*` 데코레이터의 `auth: [USER_TYPE.CLIENT]`.

## UGC 안전 장치 (2026-08-22, App Store 1.2 / 5.1.1 대응)

- 사진 삭제 `DELETE /ongi/photos/:photoId` (작성자·관리자, 댓글 함께 소프트 삭제)
- 댓글 삭제 `DELETE /ongi/photos/:photoId/comments/:commentId` (댓글 작성자·사진 작성자·관리자)
- 신고 `POST /ongi/reports { targetType: photo|comment|member, targetId, reason }` → `ongi_reports` (status open/resolved — 운영자가 24시간 내 수동 검토)
- 차단 `POST|DELETE /ongi/members/:memberId/block` → `ongi_blocks (user_id, blocked_user_id)`. 차단한 사용자의 사진·댓글은 피드/앨범/미분류/인물/댓글 조회에서 숨긴다 (`OngiPhotoAccessService.withoutBlocked`). 구성원 응답에 `blockedByMe`, `isMe` 포함.
- 내보내기 `DELETE /ongi/groups/:groupId/members/:memberId` (관리자 전용, 본인·다른 관리자 불가)
- 회원 탈퇴 `DELETE /ongi/users/me`: 사용자 익명화(sns_id 변경으로 재가입 가능) + 구성원·사진·댓글·인물 소프트 삭제 + 좋아요·차단·토큰 삭제. S3 파일은 남음.
- 관리자 가족 공간 삭제 `DELETE /ongi/admin/groups/:id` (2026-09-27, SUPER_ADMIN 전용 `deleteGroup` 권한): 공간 + 구성원·앨범·사진·댓글·일정을 한 트랜잭션에서 소프트 삭제. 함께 지워진 행은 공간과 `deleted_at` 이 같다(복구 기준). 좋아요·S3 원본은 남기고, `ongi_admin_access_logs` 에 `delete_group` 기록을 남긴다.
- 약관·개인정보처리방침(`legal/domain/constant`)에 무관용·신고·24시간 조치·위탁(Google, AWS) 조항 반영. 사업자 정보는 `[플레이스홀더]` — 출시 전 교체 필수.

## 채팅 (2026-09-27)

- API `/ongi/chat/*`: `GET rooms` · `GET unread-count` · `POST rooms {memberIds, name?}` (1명 = 1:1 — `direct_key` 로 두 사람당 하나, 2명 이상 = 그룹방) · `GET rooms/:id` · `GET|POST rooms/:id/messages` (최신 순, `?before=`) · `POST rooms/:id/read {messageId}` · `POST rooms/:id/invite {memberIds}` (그룹방, 참여자 누구나) · `POST rooms/:id/leave` (그룹방은 나가기 + 시스템 메시지, 1:1 은 내 목록에서만 지우기 — `visible_from_message_id` 를 옮겨 지운 대화는 안 보이고, 상대가 새로 보내면 다시 나타난다).
- 보이는 범위: `visible_from_message_id` 이하 메시지는 안 보인다 (초대 전 메시지 · 1:1 방을 지우기 전 메시지). 읽음 표시는 참여자별 `last_read_message_id` — 메시지마다 "안 읽은 사람 수"(카톡식)를 서버가 계산해 내려준다.
- 차단: 1:1 은 어느 한쪽이라도 차단했거나 상대가 탈퇴하면 보낼 수 없음(`canSend=false`). 내가 차단한 사람은 방 만들기·초대 불가, 그룹방에서 그 사람 메시지는 내게 안 보이고 안 읽은 수에서도 빠진다. 신고 `targetType: chat_message` (그 방 참여자이고 볼 수 있는 메시지만).
- 실시간: socket.io 네임스페이스 `/ongi-chat` (access token + `ongi_auths` 세션 확인, `user:{id}` 방). 이벤트는 `chat:message` · `chat:read` · `chat:room` 에 roomId 만 싣고, 앱은 받으면 REST 로 다시 불러온다. **서버가 컨테이너 2대**라 Redis 채널 `ongi:chat:events` 로 발행 → 각 서버가 자기 소켓에 전달. 앱은 `transports: ['websocket']` 만 사용 (polling 은 sticky session 필요).
- 푸시: 카테고리 `chat` (푸시 설정 `chat_enabled`), `inbox: false` 라 앱 내 알림 목록에는 남기지 않는다. data `{ type: 'chat', roomId }`.
- 회원 탈퇴 시 모든 방에서 나간다(`left_at`). 보낸 메시지는 남고 이름은 '탈퇴한 사용자'.

## 활동 기록 · 관리자 지표 (2026-09-29)

- **activity** (`ongi_user_daily_activity`) — 사용자 × 날짜 당 1행. 날짜는 **한국 시간** 기준 (`(now() AT TIME ZONE 'Asia/Seoul')::date`).
- 접속 기록: `OngiActivityMiddleware` 가 `/ongi/*` (관리자 `/ongi/admin/*` 제외) 의 인증된 성공 응답마다 `OngiActivityTracker.track` 을 부른다. DB 에는 사용자당 5분에 한 번만 쓴다(서버 메모리에 마지막 시각 보관, upsert 라 서버가 여러 대여도 결과는 같다). 앱을 고치지 않아도 모든 버전이 DAU·MAU 에 잡힌다. 기록은 응답 뒤에 하고 실패해도 요청에 영향이 없다.
  - 미들웨어 경로는 `ongi/*` — 이 Nest 버전(10.4)에서 `ongi/(.*)` 는 매칭되지 않는다 (`ongi-activity.middleware.spec.ts` 가 확인).
  - 토큰 id 만 믿지 않고 `ongi_auths` 에 그 access token 이 그 사용자 것으로 있는지 확인한다 (서비스들이 JWT 키를 같이 쓴다).
- 사용 시간: `POST /ongi/activity/ping { seconds, newSession, platform, appVersion }` — 앱(1.0.10 이상)이 켤 때 · 쓰는 동안 1분마다 · 화면에서 내릴 때 보낸다. 한 번에 최대 1800초, 하루 최대 86400초. 5분 넘게 떠났다 돌아오면 새 방문(`newSession`). 형식이 틀려도 400 을 내지 않고 0 · null 로 저장한다.
- 관리자 지표 `GET /ongi/admin/stats` (`dashboard` 권한): 접속자(DAU · WAU · MAU · 고착도) · 최근 30일 일별 추이 · 체류시간(최근 7일, 사용 시간을 보낸 사용자만) · 재방문율(가입 1 · 7 · 30일 뒤) · 공간(혼자인 공간 · 최근 7일 활동) · 가입 후 전환 · 플랫폼 · 앱 버전.
  - `created_at` 같은 timestamp(시간대 없음) 컬럼은 DB 세션 시간대로 읽어 한국 날짜로 바꾼다 (`kstDateOf`). 기존 `/dashboard` 의 가입 추이는 DB 날짜 기준 그대로다.
  - 접속 지표는 기록을 시작한 날(`trackingSince`)부터만 있다. 콘텐츠·공간·전환 지표는 기존 데이터로 계산한다.
- **테스트 계정** (`ongi_users.is_test`, 2026-09-29): 관리자 수치(운영 현황 `/dashboard` · 지표 `/stats`)에서 뺀다 — 테스트 계정 자체, 그 계정이 올린 사진·댓글·채팅, 구성원이 테스트 계정뿐인 공간. 섞인 공간에서는 테스트 계정을 구성원 수에서만 뺀다. 미처리 신고·미답변 문의는 처리할 일이라 그대로 센다.
  - 지정·해제 `PUT /ongi/admin/users/:id/test { isTest }` (`grant` 권한 — 최고 관리자). 본인·탈퇴한 계정도 지정할 수 있다. 사용자 응답에 `isTest`, 지표 응답에 `excludedTestUsers`.
  - 접속 기록은 테스트 계정도 남긴다 — 지정을 풀면 그동안의 기록이 수치에 돌아온다.
  - 엔티티에는 매핑하지 않았다 (관리자 raw SQL 만 읽고 쓴다) — 컬럼이 없어도 앱 API 는 영향이 없다.
- **사용자 목록** `GET /ongi/admin/users` (2026-09-29): 행마다 `lastSeenAt`(마지막 접속, 기록이 없으면 null) 과 `groups`(소속 공간) 를 함께 준다 — 관리자 화면이 상세로 들어가지 않고 표 하나로 보여준다. `?sort=seen` 은 마지막 접속 순(기록 없는 사용자는 맨 뒤).
- SQL 확인: `ongi-admin-stats.repository.spec.ts` — `ONGI_TEST_DB_URL` 을 줄 때만 실제 PostgreSQL 에서 돈다 (CI 에서는 건너뜀).

## 남은 일 (TODO)

- 사진 파일 업로드: 현재는 URL 기반 (`POST /ongi/photos` 에 url 전달). 자체 S3 버킷 + `src/ongi/common/ongi-s3.service.ts` 업로드 엔드포인트 추가 필요.
- 저장 공간(`/ongi/users/me/storage`)은 사진 수 × 5MB 추정치 — 실제 파일 저장 도입 시 교체.
- 피드 페이지네이션 (현재 전체 로드), 알림, 구성원 권한 관리(pending 승인 플로우).

- **파일 정리**: 사진 삭제·회원 탈퇴·프로필 이미지 교체 시 `AwsS3Service.deleteByUrls` 로 S3 원본을 지운다(best-effort, 실패해도 요청은 성공). 멀티 그룹 업로드는 한 파일을 여러 사진이 공유하므로 `countActiveByUrl` 이 0 일 때만 삭제. 외부 호스트 URL(소셜 프로필 이미지)은 `keyOfUrl` 이 걸러낸다.
