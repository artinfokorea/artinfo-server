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

## API 요약

- 공개: `GET /holy365/bible/versions` · `GET /holy365/bible/versions/:code/books` · `GET /holy365/bible/versions/:code/books/:book/chapters/:chapter`
- 로그인: `GET|PUT|DELETE /holy365/users/me` · `POST /holy365/transcriptions/verses` · `GET /holy365/transcriptions/chapter` · `GET /holy365/progress/summary` · `GET /holy365/progress/books?version=` · `GET /holy365/progress/daily?days=`
- 에러 코드 `HOLY365-{AUTH|USER|BIBLE|TYPING}-{NNN}` — 프론트가 코드로 언어별 문구를 고른다.
