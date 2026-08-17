# ONGI (온기) — 아키텍처

가족 사진 공유 앱 **온기(ONGI)** 의 백엔드 패키지. 클라이언트는 Expo 앱(`ongi-corp/ongi`)이며, 모든 API 는 `/ongi/*` 전용으로 제공한다 (다른 프로젝트의 API 를 공유하지 않음).

`AZEYO-ARCHITECTURE.md` 의 DDD 구조를 그대로 따른다: `presentation → application → domain ← infrastructure`. 작업 완료 후 구조/규칙 변경이 있으면 이 문서를 업데이트할 것.

## 도메인 모델

- **user** (`ongi_users`) — 계정. SNS 로그인(kakao/naver/google) 기준. `(sns_type, sns_id)` 유니크.
- **auth** (`ongi_auths`) — 발급된 access/refresh 토큰 세션.
- **group** (`ongi_groups`, `ongi_members`) — 가족 공간. 구성원(member)은 사용자 × 그룹 레코드이며 그룹마다 호칭(name)이 다르다. **사진 작성자와 댓글 작성자는 user id 가 아니라 member id** 를 가리킨다.
- **person** (`ongi_people`) — 인물 태그 대상. 구성원이 아닌 아이 등도 포함되므로 member 와 별개.
- **album** (`ongi_albums`) — 커버/부가정보(meta)는 앨범의 최신 사진에서 계산.
- **photo** (`ongi_photos`, `ongi_photo_likes`, `ongi_photo_comments`) — 그룹 피드 게시물. 여러 그룹 동시 업로드 시 그룹마다 독립 레코드가 생겨 좋아요·댓글이 분리된다. 인물 태그는 `person_ids jsonb` 배열. `like_count`/`comment_count` 는 비정규화 카운터.
- **legal** — 약관·정책 문서 (코드 상수, 테이블 없음, 공개 엔드포인트).

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
  - **개발용 로그인**: `token` 없이 호출하면 `dev-{provider}` 계정으로 로그인된다. `NODE_ENV=production` 에서는 `ONGI_ALLOW_DEV_LOGIN=true` 환경변수가 있어야 허용된다. 앱에 SNS SDK 연동이 붙으면 이 경로는 막을 것.
- 토큰: azeyo/onchurch 와 동일 (access 1시간 / refresh 60일, `POST /ongi/auths/refresh`, Redis 3초 dedupe). access 토큰 payload 는 `{ id, name }` (공용 `jwt.strategy` 가 `payload.name` 을 사용).
- 가드: 공용 `RestApi*` 데코레이터의 `auth: [USER_TYPE.CLIENT]`.

## 남은 일 (TODO)

- 사진 파일 업로드: 현재는 URL 기반 (`POST /ongi/photos` 에 url 전달). 자체 S3 버킷 + `src/ongi/common/ongi-s3.service.ts` 업로드 엔드포인트 추가 필요.
- 저장 공간(`/ongi/users/me/storage`)은 사진 수 × 5MB 추정치 — 실제 파일 저장 도입 시 교체.
- 피드 페이지네이션 (현재 전체 로드), 알림, 구성원 권한 관리(pending 승인 플로우).
