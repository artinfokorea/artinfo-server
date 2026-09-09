# SALPYEO (살펴) — 아키텍처

법으로 가격·평가 공개가 의무화된 시설(산후조리원·요양원·장례식장·어린이집·학원)의 공공데이터를 비교하는 서비스 **살펴** 의 백엔드 패키지. 클라이언트는 Next.js 웹(`choral7451/salpyeo-client`)이며, 모든 API 는 `/salpyeo/*` 로 제공한다.

`AZEYO-ARCHITECTURE.md` 의 DDD 구조를 그대로 따른다: `presentation → application → domain ← infrastructure`. 작업 완료 후 구조/규칙 변경이 있으면 이 문서를 업데이트할 것.

## 도메인 모델

- **facility** (`salpyeo_facilities`) — 5개 버티컬 공통 시설 레코드. `slug` 가 URL 식별자(예: `post-a9656bde`). 요금표·점검·사진·후기처럼 버티컬마다 항목 수가 다른 값은 JSONB (`price_rows`, `inspections`, `images`, `review`). 시설 정보 컬럼은 `sido`·`sigungu`·`operator_type`·`address`·`phone`·`website`.
- **user** (`salpyeo_users`) — 구글 로그인 계정. `(sns_type, sns_id)` 유니크(소프트 삭제 제외). 로그인할 때마다 구글 프로필(이름·이메일·사진)을 덮어쓴다. `role` 은 `USER` | `ADMIN` 이고 **가입 경로로는 ADMIN 이 될 수 없다** — 승격은 DB 에서 직접 `UPDATE salpyeo_users SET role = 'ADMIN' WHERE email = '…'`.
- **auth** (`salpyeo_auths`) — 발급된 로그인 세션(access/refresh 토큰과 각 만료시각).
- **vertical** — 테이블 없음. `domain/constant/salpyeo-vertical.constant.ts` 상수. `enabled` 플래그로 준비 중 버티컬을 제어하고, `count` 는 DB 집계로 채운다.

## API

| 메서드·경로 | 설명 |
| --- | --- |
| `GET /salpyeo/verticals` | 버티컬 5개 (label·priceLabel·source·asOf·enabled·count) |
| `GET /salpyeo/verticals/:key` | 단건. 미지 키 → 404 `SALPYEO-VERTICAL-001` |
| `GET /salpyeo/facilities?vertical=post&q=&slugs=a,b&sort=priceAsc` | 목록. `vertical` 필수(400). `q` 는 이름·위치 요약·주소 부분 일치. `sort` ∈ priceAsc(가격 0=미공개는 맨 뒤)·ratingDesc·reviewsDesc·distanceAsc |
| `GET /salpyeo/facilities/:slug` | 상세. 없으면 404 `SALPYEO-FACILITY-001` |
| `POST /salpyeo/auths/login` | 구글 로그인 `{ provider: 'google', token }` → `{ user, tokens }`. 미가입이면 자동 가입 |
| `POST /salpyeo/auths/refresh` | `{ accessToken, refreshToken }` → 새 토큰. refresh 만료 1시간 미만이면 refresh 도 회전 |
| `GET /salpyeo/users/me` | 내 정보 (Bearer 필요). `role` 포함 |
| `GET /salpyeo/admin/facilities?vertical=&q=` | **관리자** 목록. 노출 내린 시설 포함 |
| `GET /salpyeo/admin/facilities/:slug` | **관리자** 상세 — 편집 폼용으로 저장된 컬럼을 그대로 |
| `PUT /salpyeo/admin/facilities/:slug` | **관리자** 수정. 보낸 필드만 반영 |

시설 조회는 전부 공개(비로그인)이고, `/salpyeo/auths/*` 와 `/salpyeo/users/me` 는 로그인, `/salpyeo/admin/*` 은 `SalpyeoAdminGuard`(토큰 검증 후 **DB 의 role 을 다시 조회**)로 관리자만. 토큰에 role 을 담지 않는 이유는 권한을 내렸을 때 이미 발급된 토큰(최대 1시간)이 살아남으면 안 되기 때문이다.

응답은 공용 `ResponseInterceptor` 봉투 `{ code: 'OK', message: null, item }`.

## 규칙/결정 사항

- 테이블 prefix `salpyeo_`. DDL 은 `facility/salpyeo-facilities.ddl.sql`. synchronize:false 이므로 `common/salpyeo-schema-bootstrap.service.ts` 가 기동 시 `CREATE TABLE IF NOT EXISTS` + `ALTER TABLE ADD COLUMN IF NOT EXISTS` 를 멱등 적용한다.
- **시설 정보의 원천은 DB 다 (2026-09-09 결정).** 갱신은 관리자 페이지(`PUT /salpyeo/admin/facilities/:slug`)로만 하고, 공공데이터로 다시 덮어쓰지 않는다. 그래서 부트스트랩의 시드 동기화는 `INSERT ... ON CONFLICT (slug) DO NOTHING` (100건 배치)뿐이다 — **이미 있는 행은 절대 건드리지 않고, 시드에 없는 slug 를 지우지도 않는다**. 시드 상수는 빈 DB(새 환경)를 채우는 용도로만 남는다. 예전의 `DO UPDATE` + prune 규칙은 관리자 수정이 배포마다 되돌아가기 때문에 없앴다.
- **시드 원본(빈 DB 채우기용)의 데이터 원천은 두 갈래 — 공공데이터 + 각 조리원 공식 홈페이지.** 두 값이 다르면 **공식 홈페이지가 우선**한다 (전화·주소·요금). 어느 쪽에도 없는 값은 지어내지 않는다.
  1. 공공데이터포털 "보건복지부_전국 산후조리원 현황" (2023-12-31, 456건) CSV → `scripts/import-post-facility-csv.ts` → `domain/constant/salpyeo-post-facility-data.constant.ts` (자동 생성, 손으로 수정 금지). 원본 요금 단위는 만원(2주 기준) → 원으로 환산.
  2. 조리원 공식 홈페이지 수집(사진·요금·연락처·주소) → `scripts/import-post-facility-enrichment.ts <수집 디렉터리> --verify-images` → `domain/constant/salpyeo-post-facility-enrichment.constant.ts` (자동 생성). 스크립트가 검증한다: 이미지는 **공식 도메인 또는 알려진 홈페이지 빌더 CDN**(아임웹·카페24 등)의 jpg/png/webp 만, `--verify-images` 로 실제 응답·픽셀 크기(400x300 이상)까지 확인해 크기를 채운다. 요금은 50만~3,000만원 범위 밖이면 버린다.
  이 스크립트들로 시드를 다시 만들어도 **이미 DB 에 있는 시설에는 반영되지 않는다** (위의 DO NOTHING 규칙). 기존 시설에 넣으려면 관리자 페이지에서 고치거나 `scripts/rehost-facility-images.ts --from-seed` 같은 별도 반영 경로를 쓴다.
- 두 자료 병합 + 시설 변환은 `domain/service/salpyeo-post-facility-seed.ts` (순수 함수). 아직 연동 전이라 **빈 값으로 두는 것**: distance `''/0`, inspectionBadge `''`, inspections `[]`, rating/reviewCount `0`, review `null`. 요금 미공개는 price `0`, 홈페이지를 못 찾았으면 website `''`·images `[]`. `vsAvgPercent` 는 같은 시도 안 일반실 평균(표시되는 요금 기준) 대비. 홈페이지에 2주 요금이 하나라도 있으면 요금표는 홈페이지 기준으로만 만든다 (두 출처를 한 표에 섞지 않는다). `slug` 는 `post-` + sha1(시도|시군구|이름) 앞 8자리라 데이터 갱신으로 순번이 바뀌어도 URL 이 유지된다.
- 검색·정렬은 `domain/service/salpyeo-facility-query.ts` 순수 함수 (전국 456건이라 메모리 처리). 수천 건 규모가 되면 repository 쿼리로 내리고 pagination·지역 파라미터 추가.
- Postgres 없이 확인할 때는 `SALPYEO_REPOSITORY=memory PORT=4000 npx ts-node -r tsconfig-paths/register src/salpyeo/salpyeo-standalone.ts` 로 살펴 모듈만 시드 메모리 리포지토리로 띄운다 (로컬 프론트 연동 확인용, 배포 워크플로는 주입하지 않음). 전체 앱(`src/main.ts`)은 `PORT` 환경변수로 포트를 바꿀 수 있다 (기본 3000).
- **로그인은 구글만, 온기와 같은 방식** — 프론트가 Google Identity Services 로 구글 access token 을 받아 `POST /salpyeo/auths/login` 에 넘기고, 서버는 그 토큰으로 `googleapis.com/oauth2/v3/userinfo` 를 조회해 신원을 확인한 뒤 자체 JWT 를 발급한다. 서버가 리디렉션·코드 교환을 하지 않으므로 **구글 client secret 은 쓰지 않는다** (프론트의 `NEXT_PUBLIC_GOOGLE_CLIENT_ID` 와 콘솔의 '승인된 JavaScript 원본'만 있으면 된다). access token payload 는 공용 `JwtStrategy` 가 그대로 `UserSignature` 로 넘기므로 `id`·`name`·`email` 을 담고, 서명 키는 공용 `JWT_TOKEN_KEY` 다.
- 계정·세션도 `SALPYEO_REPOSITORY=memory` 인메모리 구현이 있어 standalone 으로 로그인까지 확인할 수 있다 (프로세스를 내리면 가입 기록이 사라진다). 이때만 `JWT_TOKEN_KEY` 가 없어도 로컬 전용 키로 동작한다.
- 에러 코드는 `SALPYEO-{DOMAIN}-{NNN}`.
- 게이트: `npx tsc --noEmit` · `npx eslint "src/salpyeo/**/*.ts"` · `npx jest src/salpyeo` (CI 동일).

## 남은 일 (TODO)

- 지역(시도/시군구) 필터 파라미터 및 사용자 위치 기반 거리 — 현재 전국 목록 + 검색어만.
- 보건소 점검 결과·후기 데이터 연동 (현재 빈 값). 다른 버티컬 공공데이터 연동.
- 홈페이지를 못 찾은 시설의 사진 보강.
- 비교 리포트 AI 요약 서버 생성 (`POST /salpyeo/reports`), 문의 전달, 인증 후기 작성.
- 로그인으로 할 수 있는 일 — 찜/비교함 서버 저장, 후기 작성, 회원 탈퇴(`DELETE /salpyeo/users/me`). 현재는 로그인·내 정보 조회·관리자 편집까지.
- 관리자 편집에서 빠진 것: 공식 홈페이지(`website` — 홈페이지 보강 브랜치가 머지되면 추가), 시설 추가·삭제(노출 끄기로 대신), 점검·후기·평점(연동 전), 수정 이력.
- 요양원·장례식장·어린이집·학원 `enabled` 전환.
