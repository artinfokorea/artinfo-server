# artinfo-server — 작업 규칙

- **작업 시작 전 `git pull` 필수** — 코드 수정 전 항상 최신 상태로 pull 받고 시작할 것
- **빌드 성공 시 항상 커밋 & 푸시** — 작업 완료 후 빌드 문제가 없으면 별도 요청 없이 바로 커밋하고 `git push origin main`까지 실행

## AI 개발 프로세스 (온기)

1. 요청에 기대값을 함께 명시한다 — 그 기대값이 곧 테스트 케이스다.
2. 구현 전에 테스트부터 작성한다. 기대값은 리터럴로 하드코딩할 것 (구현과 같은 로직으로 기대값을 계산하지 말 것).
3. **테스트가 실패하면 테스트를 고치지 말고 구현을 의심할 것.** 기대값 수정은 사유와 함께 별도 커밋으로만.
4. 새 컬럼 추가 시 다섯 곳 체크리스트: 엔티티 · Creator · **repository 의 create/save** · 요청 DTO · 응답 DTO.
5. API 는 하위 호환만 — 필드 추가는 가능, 제거·의미 변경 금지 (구버전 앱이 살아 있다).
6. DDL 은 항상 멱등(IF NOT EXISTS / ON CONFLICT) — ongi-schema-bootstrap 에 추가.
7. 커밋 전 게이트: `npx tsc --noEmit` · `npx eslint src/ongi` · `npx jest src/ongi` 모두 통과. CI 가 같은 검사를 강제한다.
