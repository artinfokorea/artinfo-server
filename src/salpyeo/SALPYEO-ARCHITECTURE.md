# SALPYEO (살펴) — 아키텍처

법으로 가격·평가 공개가 의무화된 시설(산후조리원·요양원·장례식장·어린이집·학원)의 공공데이터를 비교하는 서비스 **살펴** 의 백엔드 패키지. 클라이언트는 Next.js 웹(`choral7451/salpyeo-client`)이며, 모든 API 는 `/salpyeo/*` 로 제공한다.

`AZEYO-ARCHITECTURE.md` 의 DDD 구조를 그대로 따른다: `presentation → application → domain ← infrastructure`. 작업 완료 후 구조/규칙 변경이 있으면 이 문서를 업데이트할 것.

## 도메인 모델

- **facility** (`salpyeo_facilities`) — 5개 버티컬 공통 시설 레코드. `slug` 가 URL 식별자(예: `p1`). 요금표·점검·사진·후기처럼 버티컬마다 항목 수가 다른 값은 JSONB (`price_rows`, `inspections`, `images`, `review`).
- **vertical** — 테이블 없음. `domain/constant/salpyeo-vertical.constant.ts` 상수. `enabled` 플래그로 준비 중 버티컬을 제어하고, `count` 는 DB 집계로 채운다.

## API (전부 공개, 비로그인)

| 메서드·경로 | 설명 |
| --- | --- |
| `GET /salpyeo/verticals` | 버티컬 5개 (label·priceLabel·source·enabled·count) |
| `GET /salpyeo/verticals/:key` | 단건. 미지 키 → 404 `SALPYEO-VERTICAL-001` |
| `GET /salpyeo/facilities?vertical=post&q=&slugs=p1,p2&sort=priceAsc` | 목록. `vertical` 필수(400). `sort` ∈ priceAsc·ratingDesc·reviewsDesc·distanceAsc |
| `GET /salpyeo/facilities/:slug` | 상세. 없으면 404 `SALPYEO-FACILITY-001` |

응답은 공용 `ResponseInterceptor` 봉투 `{ code: 'OK', message: null, item }`.

## 규칙/결정 사항

- 테이블 prefix `salpyeo_`. DDL 은 `facility/salpyeo-facilities.ddl.sql`. synchronize:false 이므로 `common/salpyeo-schema-bootstrap.service.ts` 가 기동 시 `CREATE TABLE IF NOT EXISTS` + 시드 `INSERT ... ON CONFLICT (slug) DO NOTHING` 을 멱등 적용한다.
- 시드(`domain/constant/salpyeo-facility-seed.constant.ts`)는 디자인 프로토타입의 샘플 데이터. 공공데이터 연동 시 수집 파이프라인이 이 테이블을 upsert 하는 구조로 바꾼다.
- 검색·정렬은 `domain/service/salpyeo-facility-query.ts` 순수 함수 (한 지역 수십 건 수준이라 메모리 처리). 전국 확장 시 repository 쿼리로 내리고 pagination 추가.
- Postgres 없이 확인할 때는 `SALPYEO_REPOSITORY=memory PORT=4000 npx ts-node -r tsconfig-paths/register src/salpyeo/salpyeo-standalone.ts` 로 살펴 모듈만 시드 메모리 리포지토리로 띄운다 (로컬 프론트 연동 확인용, 배포 워크플로는 주입하지 않음). 전체 앱(`src/main.ts`)은 `PORT` 환경변수로 포트를 바꿀 수 있다 (기본 3000).
- 에러 코드는 `SALPYEO-{DOMAIN}-{NNN}`.
- 게이트: `npx tsc --noEmit` · `npx eslint "src/salpyeo/**/*.ts"` · `npx jest src/salpyeo` (CI 동일).

## 남은 일 (TODO)

- 공공데이터(모자보건법 요금 공개 등) 실연동 및 지역(구/동) 파라미터화 — 현재 분당구 정자동 고정.
- 비교 리포트 AI 요약 서버 생성 (`POST /salpyeo/reports`), 문의 전달, 인증 후기 작성.
- 요양원·장례식장·어린이집·학원 `enabled` 전환.
