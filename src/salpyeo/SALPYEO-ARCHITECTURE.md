# SALPYEO (살펴) — 아키텍처

법으로 가격·평가 공개가 의무화된 시설(산후조리원·요양원·장례식장·어린이집·학원)의 공공데이터를 비교하는 서비스 **살펴** 의 백엔드 패키지. 클라이언트는 Next.js 웹(`choral7451/salpyeo-client`)이며, 모든 API 는 `/salpyeo/*` 로 제공한다.

`AZEYO-ARCHITECTURE.md` 의 DDD 구조를 그대로 따른다: `presentation → application → domain ← infrastructure`. 작업 완료 후 구조/규칙 변경이 있으면 이 문서를 업데이트할 것.

## 도메인 모델

- **facility** (`salpyeo_facilities`) — 5개 버티컬 공통 시설 레코드. `slug` 가 URL 식별자(예: `post-a9656bde`). 요금표·점검·사진·후기처럼 버티컬마다 항목 수가 다른 값은 JSONB (`price_rows`, `inspections`, `images`, `review`). 공공데이터 원본 값은 `sido`·`sigungu`·`operator_type`·`address`·`phone` 컬럼.
- **vertical** — 테이블 없음. `domain/constant/salpyeo-vertical.constant.ts` 상수. `enabled` 플래그로 준비 중 버티컬을 제어하고, `count` 는 DB 집계로 채운다.

## API (전부 공개, 비로그인)

| 메서드·경로 | 설명 |
| --- | --- |
| `GET /salpyeo/verticals` | 버티컬 5개 (label·priceLabel·source·asOf·enabled·count) |
| `GET /salpyeo/verticals/:key` | 단건. 미지 키 → 404 `SALPYEO-VERTICAL-001` |
| `GET /salpyeo/facilities?vertical=post&q=&slugs=a,b&sort=priceAsc` | 목록. `vertical` 필수(400). `q` 는 이름·위치 요약·주소 부분 일치. `sort` ∈ priceAsc(가격 0=미공개는 맨 뒤)·ratingDesc·reviewsDesc·distanceAsc |
| `GET /salpyeo/facilities/:slug` | 상세. 없으면 404 `SALPYEO-FACILITY-001` |

응답은 공용 `ResponseInterceptor` 봉투 `{ code: 'OK', message: null, item }`.

## 규칙/결정 사항

- 테이블 prefix `salpyeo_`. DDL 은 `facility/salpyeo-facilities.ddl.sql`. synchronize:false 이므로 `common/salpyeo-schema-bootstrap.service.ts` 가 기동 시 `CREATE TABLE IF NOT EXISTS` + `ALTER TABLE ADD COLUMN IF NOT EXISTS` 를 멱등 적용하고, 시드를 slug 기준 `INSERT ... ON CONFLICT DO UPDATE` (100건 배치) 한 뒤 **시드에 없는 slug 는 DELETE** 한다. 시드가 유일한 데이터 원천인 동안만 유효한 규칙 — 관리자 편집·후기 같은 사용자 데이터가 붙으면 prune 을 없애고 upsert 만 남길 것.
- **데이터 원천 = 공공데이터 그대로.** 산후조리원은 공공데이터포털 "보건복지부_전국 산후조리원 현황" (2023-12-31, 456건) CSV 를 `scripts/import-post-facility-csv.ts` 로 변환한 `domain/constant/salpyeo-post-facility-data.constant.ts` (자동 생성, 손으로 수정 금지). 새 CSV 가 나오면 같은 스크립트로 재생성해 커밋하면 배포 시 bootstrap 이 반영한다. 원본 요금 단위는 만원(2주 기준) → 원으로 환산.
- 레코드 → 시설 변환은 `domain/service/salpyeo-post-facility-seed.ts` (순수 함수). **공공데이터에 없는 값은 지어내지 않는다**: distance `''/0`, inspectionBadge `''`, inspections `[]`, rating/reviewCount `0`, review `null`, images `[]`. 일반실 미공개는 price `0`. `vsAvgPercent` 는 같은 시도 안 일반실 평균 대비. `slug` 는 `post-` + sha1(시도|시군구|이름) 앞 8자리라 데이터 갱신으로 순번이 바뀌어도 URL 이 유지된다.
- 검색·정렬은 `domain/service/salpyeo-facility-query.ts` 순수 함수 (전국 456건이라 메모리 처리). 수천 건 규모가 되면 repository 쿼리로 내리고 pagination·지역 파라미터 추가.
- Postgres 없이 확인할 때는 `SALPYEO_REPOSITORY=memory PORT=4000 npx ts-node -r tsconfig-paths/register src/salpyeo/salpyeo-standalone.ts` 로 살펴 모듈만 시드 메모리 리포지토리로 띄운다 (로컬 프론트 연동 확인용, 배포 워크플로는 주입하지 않음). 전체 앱(`src/main.ts`)은 `PORT` 환경변수로 포트를 바꿀 수 있다 (기본 3000).
- 에러 코드는 `SALPYEO-{DOMAIN}-{NNN}`.
- 게이트: `npx tsc --noEmit` · `npx eslint "src/salpyeo/**/*.ts"` · `npx jest src/salpyeo` (CI 동일).

## 남은 일 (TODO)

- 지역(시도/시군구) 필터 파라미터 및 사용자 위치 기반 거리 — 현재 전국 목록 + 검색어만.
- 보건소 점검 결과·사진·후기 데이터 연동 (현재 빈 값). 다른 버티컬 공공데이터 연동.
- 비교 리포트 AI 요약 서버 생성 (`POST /salpyeo/reports`), 문의 전달, 인증 후기 작성.
- 요양원·장례식장·어린이집·학원 `enabled` 전환.
