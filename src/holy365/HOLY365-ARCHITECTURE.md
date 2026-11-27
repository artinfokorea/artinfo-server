# HOLY365 (홀리365) — 아키텍처

성경 온라인 필사 웹서비스 **홀리365** 의 백엔드 패키지. 프론트는 Next.js 웹(`holy365-front`), 모든 API 는 `/holy365/*` 전용이다 (다른 프로젝트의 API·테이블을 공유하지 않음).
구조는 온기와 같은 `presentation → application → domain ← infrastructure`. 모듈은 `Holy365Module` 하나.

## 도메인 모델

- **user** (`holy365_users`) — **소셜 로그인만** (`sns_type=google|kakao|naver`, 로컬 개발 로그인은 `dev`). `(sns_type, sns_id)` 유니크. 같은 이메일이라도 제공자가 다르면 별개 계정(자동 연결하지 않음). 서비스 언어 `locale` = ko | en.
- **auth** (`holy365_auths`) — 세션. access 1시간 / refresh 60일. access payload `{ id, name, svc: 'holy365' }`.
- **bible** (`holy365_bible_versions`, `holy365_verses`, `holy365_chapters`) — 번역본 `NKRV`(개역개정) · `KJV`. 본문이 들어온 번역본만 목록에 나온다. `holy365_chapters` 는 가져오기 스크립트가 만드는 장별 절 수.
- **transcription** (`holy365_verse_counts`, `holy365_user_versions`, `holy365_daily_activity`) — 절마다 몇 번 썼는지, 번역본별 마지막 위치, 하루 필사량(한국 시간).

## 완주 횟수 규칙 (`transcription/domain/holy365-progress.ts`)

- 범위(장·권·성경 전체)의 **모든 절을 n번 이상 썼으면 n번 완주**. 한 절이라도 안 썼으면 0.
- 장의 "이번 회차 진행" = 그 장 완주 횟수보다 많이 쓴 절 수. 성경 전체 진행률 = 전체 완주 횟수보다 많이 쓴 절 / 전체 절.
- 순서는 자유 — 어느 장이든 골라 쓸 수 있고, 같은 장을 여러 번 쓰면 그 장 횟수만 올라간다.

## 필사 검증 (`transcription/domain/holy365-typing.ts`)

- 서버가 본문과 비교해 **같을 때만** 기록한다 (`HOLY365-TYPING-001`). 둥근 따옴표·특수 공백·연속 공백만 너그럽게 보고 나머지는 글자 그대로(대소문자 포함).
- 프론트 `src/lib/typing.ts` 가 같은 규칙을 쓴다 — 한쪽을 고치면 다른 쪽도 고칠 것.
- 같은 절을 3초 안에 다시 보내면 횟수를 올리지 않는다 (`counted: false`). 절당 시간은 0~600초로 자른다.

## 인증

- 가입·로그인은 소셜로만 (이메일 가입·비밀번호 없음). 처음 로그인하면 자동 가입.
- 소셜(웹 authorization code): 프론트가 `POST /holy365/auths/sns/:provider/authorize-url {redirectUri, state}` 로 받은 주소로 이동 → 제공자가 `{origin}/{locale}/auth/callback/{provider}?code&state` 로 돌려보냄 → 프론트가 state 확인 후 `POST /holy365/auths/sns {provider, code, redirectUri, state}` → 서버가 client secret 으로 code 교환 · 프로필 조회 · 미가입이면 가입.
  - `redirectUri` 는 `HOLY365_WEB_ORIGINS` 출처의 `/{locale}/auth/callback/{provider}` 만 허용.
- 토큰 재발급 `POST /holy365/auths/refresh {refreshToken}` — refresh token 은 남은 기간이 7일 미만일 때만 교체(여러 탭 동시 갱신 안전). 로그아웃 `POST /holy365/auths/logout` 은 그 세션만 폐기.
- 가드: `@Holy365Auth()` (`common/holy365-auth.guard.ts`) — 공용 JWT 키를 쓰는 다른 서비스 토큰은 `svc` 가 달라 막힌다. 공용 `RestApi*` 의 `auth` 옵션은 쓰지 않는다.
- **개발용 로그인** `POST /holy365/auths/dev` — 로컬 `.env` 에 `HOLY365_DEV_LOGIN=true` 가 있을 때만(기본 차단, 배포 워크플로는 주입하지 않음). 프론트는 `next dev` 에서만 버튼을 보인다.
- 탈퇴 `DELETE /holy365/users/me` — 계정 익명화 + 세션·필사 기록 삭제(재가입 가능).

## 환경변수

| 이름 | 설명 |
| --- | --- |
| `HOLY365_WEB_ORIGINS` | 프론트 출처, 쉼표 구분 (기본 `http://localhost:3000`) |
| `HOLY365_GOOGLE_CLIENT_ID` / `_SECRET` | Google OAuth 웹 클라이언트 |
| `HOLY365_KAKAO_CLIENT_ID` / `_SECRET` | 카카오 REST API 키 / (사용 시) Client Secret |
| `HOLY365_NAVER_CLIENT_ID` / `_SECRET` | 네이버 로그인 애플리케이션 |

설정이 없는 제공자는 `HOLY365-AUTH-007`(503) — 프론트는 "준비 중" 으로 안내한다. 각 콘솔에 Redirect URI `https://{도메인}/ko/auth/callback/{provider}` 와 `/en/...` 를 둘 다 등록할 것.

## 스키마 · 본문 가져오기

- DDL 원본은 `common/holy365-schema.ts` (전부 멱등). 기동 시 `Holy365SchemaBootstrapService` 가 실행한다.
- 본문 가져오기 (번역본 하나를 통째로 교체):
  ```bash
  # KJV (Public Domain)
  npx ts-node -r tsconfig-paths/register src/holy365/bible/script/holy365-import-bible.ts \
    --code KJV --url https://raw.githubusercontent.com/thiagobodruk/bible/master/json/en_kjv.json
  # 개역개정 — 대한성서공회 사용 허락 후 받은 파일
  npx ts-node -r tsconfig-paths/register src/holy365/bible/script/holy365-import-bible.ts --code NKRV --file ./nkrv.json
  ```
  지원 형식은 `bible/domain/holy365-bible-import.ts` (권 배열 · `{books}` · 평평한 `{book,chapter,verse,text}`).
- **저작권**: 개역개정은 대한성서공회 저작물이다. 사용 허락을 받기 전에는 운영 DB 에 넣지 말 것. KJV 는 퍼블릭 도메인.

## 본문 검색 (2026-11-27)

- `GET /holy365/bible/versions/:code/search?q=&offset=` — 띄어 쓴 단어(최대 5개)가 **모두** 들어간 절을 권·장·절 순으로 30절씩. `total` · `terms`(강조용) 포함. `%` `_` 는 글자 그대로 찾는다 (`bible/domain/holy365-search.ts`). 번역본당 3만 절이라 인덱스 없이 ILIKE.
- 장절 바로 가기("요 3:16", "John 3:16")와 권 이름 찾기는 프론트(`holy365-front/src/lib/bible-ref.ts`)가 한다.

## 피드 (2026-11-27)

- `holy365_posts` (글 ≤ 2,000자 · `aspect` 1:1 | 4:5 · `images` jsonb 최대 10장 · `verses` jsonb 스냅샷 배열 — 예전 `verse` 열은 부팅 때 `verses` 로 옮겨진다), `holy365_post_likes`, `holy365_post_comments`, `holy365_reports`. `like_count`/`comment_count` 는 비정규화 카운터.
- 사진: `POST /holy365/feed/images?aspect=` (multipart `files`, 최대 10장) → sharp 로 가운데 기준 1080×1080 / 1080×1350 WebP, S3 공개 `holy365/feed/{userId}/`. 게시물에는 **그 사용자가 올린 피드 경로 URL 만** 넣을 수 있다 (`isFeedImageUrl`).
- 구절: `verses: [{versionCode, book, chapter, verseStart, verseEnd}]` (구절 5개까지, 한 구절은 같은 장의 연속 30절까지) — 본문은 서버가 DB 에서 가져와 그 시점 그대로 저장한다. 응답의 `verses[].text` 에 본문이 들어 있다.
- `GET /holy365/feed/posts?scope=all|following|user:{id}&before=` (20개씩, 최신 순) · `GET|DELETE /posts/:id` · `POST|DELETE /posts/:id/like` · `GET|POST /posts/:id/comments` · `DELETE /comments/:id`(댓글 쓴 사람·게시물 주인) · `POST /reports`.
- 시각은 UTC ISO(`...Z`)로 내려준다 (DB 세션 UTC, timestamp 에 시간대가 없어서).
- 주의: TypeORM(postgres) 는 `UPDATE/DELETE ... RETURNING` 결과를 `[rows, count]` 로 준다 — `returnedRows()` 로 꺼낼 것.
- 탈퇴 시 게시물·댓글 소프트 삭제, 좋아요 삭제.

## 커뮤니티 (2026-11-27)

- `GET /holy365/community/rankings?period=day|week|month|year&limit=` — 기간(한국 날짜 기준: 오늘 · 이번 주 월요일부터 · 이번 달 1일부터 · 올해 1월 1일부터) 필사 절 수 합계 순위. 동점은 같은 순위(1, 2, 2, 4). 토큰이 있으면 `me: { rank, verses }` 포함(로그인은 선택 — `Holy365OptionalUser`).
- `GET /holy365/community/stats` — 오늘·누적 필사자 수와 절 수, 최근 7일 많은 사람이 쓴 장(`popularChapters`).
- 개발용 계정(`sns_type='dev'`)·탈퇴 계정은 랭킹·통계에서 뺀다. 랭킹에는 사용자 이름(닉네임)이 공개된다.

## SNS · 교회 (2026-11-27)

- **교회** (`holy365_churches`) — 같은 교회 판단:
  1. 카카오 장소 검색에서 고르면 `kakao_place_id`(유니크)로 판단 — 이름이 같아도 지점이 다르면 다른 교회.
  2. 직접 등록은 `church_key` = 정리한 이름 + 지역 (`social/domain/holy365-church-name.ts`): 괄호 속 교단·띄어쓰기·끝의 "교회/church" 제거, 지역은 "서울특별시 서초구" → "서울 서초구" 처럼 시/도 + 시/군/구로 통일.
  3. 직접 등록한 교회가 나중에 카카오 장소로 들어오면 같은 키의 교회에 `place_id` 를 붙여 합친다. 직접 등록 시 같은 키의 카카오 교회가 있으면 그 교회를 쓴다.
  - 카카오 키: `HOLY365_KAKAO_REST_KEY`, 없으면 로그인용 REST 키 `HOLY365_KAKAO_CLIENT_ID`. 둘 다 없으면 등록된 교회 검색 + 직접 등록만.
- `holy365_users.church_id`, `profile_public`(기본 true — false 면 남에게 진행 상황 비공개, 추천에서도 제외).
- **팔로우** (`holy365_follows`, 단방향). 추천 = ① 같은 교회 ② 나를 팔로우하는데 내가 안 한 사람 ③ 최근 7일 필사한 사람 (나·이미 팔로우·비공개·개발용 제외).
- API: `GET /holy365/users/:id/profile` (로그인 선택, 비공개면 summary=null) · `GET /holy365/users/:id/progress/books|daily` (비공개면 403 `HOLY365-SOCIAL-001`) · `POST|DELETE /holy365/users/:id/follow` · `GET /holy365/users/:id/followers|following` · `GET /holy365/social/recommendations|feed` · `GET /holy365/social/users?q=` · `GET /holy365/churches/search?q=` · `POST /holy365/churches` · `GET /holy365/churches/:id` · `PUT /holy365/users/me {churchId, profilePublic}`.
- 탈퇴 시 교회 연결과 팔로우를 지운다.
- 프로필 사진 `POST /holy365/users/me/avatar` (multipart `file`, jpg·png·webp·gif ≤ 10MB) → sharp 로 400×400 WebP, S3 공개 `holy365/avatars/{userId}/`. 이전에 올린 사진은 지운다(소셜 프로필 URL 은 건드리지 않음). `DELETE /holy365/users/me/avatar` 로 지우기.

## API 요약

- 공개: `GET /holy365/community/rankings` · `GET /holy365/community/stats` · `GET /holy365/bible/versions` · `GET /holy365/bible/versions/:code/books` · `GET /holy365/bible/versions/:code/books/:book/chapters/:chapter`
- 로그인: `GET|PUT|DELETE /holy365/users/me` · `POST /holy365/transcriptions/verses` · `GET /holy365/transcriptions/chapter` · `GET /holy365/progress/summary` · `GET /holy365/progress/books?version=` · `GET /holy365/progress/daily?days=`
- 에러 코드 `HOLY365-{AUTH|USER|BIBLE|TYPING}-{NNN}` — 프론트가 코드로 언어별 문구를 고른다.
