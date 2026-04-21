# Azeyo DDD 아키텍처 가이드

> **작업 완료 후 반드시 이 문서를 확인하고, 구조/규칙 변경이 있으면 업데이트할 것.**

## 필수 원칙

- **Transaction**: 여러 쓰기 작업이 하나의 논리 단위인 경우 반드시 트랜잭션으로 묶는다. UseCase에서 `DataSource.transaction()` 또는 `QueryRunner`를 사용하고, 실패 시 전체 롤백을 보장한다.
- **Performance**: 불필요한 쿼리를 줄이고 N+1 문제를 방지한다. 목록 조회 시 pagination을 적용하고, 필요한 컬럼만 select한다. 자주 조회되는 데이터는 Redis 캐싱을 고려한다.
- **Table Prefix**: 모든 DB 테이블 이름에 `azeyo_` prefix를 붙인다. (예: `azeyo_users`, `azeyo_auths`, `azeyo_posts`)

---

## 레이어 구조

모든 도메인은 아래 4개 레이어로 구성한다.

```
{domain}/
├── presentation/      # 외부 요청/응답 처리
│   ├── controller/    # REST 컨트롤러
│   └── dto/
│       ├── request/   # 요청 DTO (validation, swagger)
│       └── response/  # 응답 DTO
├── application/       # 비즈니스 유스케이스
│   ├── usecase/       # UseCase 클래스 (1 클래스 = 1 기능, execute() 메서드)
│   └── command/       # 커맨드 객체 (request → command 변환)
├── domain/            # 핵심 도메인 모델
│   ├── entity/        # 엔티티 (TypeORM)
│   ├── repository/    # 리포지토리 인터페이스 (Symbol + interface)
│   ├── exception/     # 도메인 예외
│   └── service/       # 도메인 서비스 인터페이스 (외부 의존 추상화)
│       └── dto/       # 도메인 DTO (Value Object)
├── infrastructure/    # 구현체 (DB, 외부 API)
│   ├── repository/    # 리포지토리 구현체 (TypeORM)
│   └── service/       # 외부 서비스 구현체 (axios 등)
└── {domain}.module.ts # NestJS 모듈 (DI 바인딩)
```

---

## 의존성 규칙

```
presentation → application → domain ← infrastructure
```

| 레이어 | 참조 가능 | 참조 불가 |
|--------|-----------|-----------|
| **presentation** | application, domain | infrastructure |
| **application** | domain (interface만) | infrastructure 직접 참조 |
| **domain** | 없음 (순수 도메인) | application, infrastructure, presentation |
| **infrastructure** | domain | application, presentation |

### 핵심: application ↔ infrastructure 연결

application에서 infrastructure를 직접 import하지 않는다.
domain에 정의된 **인터페이스(Symbol 토큰)**를 통해 주입받는다.

```typescript
// domain/repository/xxx.repository.interface.ts
export const MY_REPOSITORY = Symbol('MY_REPOSITORY');
export interface IMyRepository {
  findById(id: number): Promise<MyEntity>;
}

// infrastructure/repository/xxx.repository.ts
@Injectable()
export class MyRepository implements IMyRepository { ... }

// application/usecase/xxx.usecase.ts
@Inject(MY_REPOSITORY)
private readonly myRepository: IMyRepository;

// module.ts
{ provide: MY_REPOSITORY, useClass: MyRepository }
```

---

## UseCase 규칙

application 레이어의 클래스는 반드시 **UseCase** 단위로 만든다.

### 원칙
- **1 UseCase = 1 클래스 = 1 기능**
- 모든 UseCase는 `execute()` 메서드 하나만 갖는다
- UseCase 클래스명: `Azeyo{Action}UseCase` (예: `AzeyoSignupUseCase`)
- 파일명: `azeyo-{action}.usecase.ts` (예: `azeyo-signup.usecase.ts`)

### 구조

```typescript
@Injectable()
export class AzeyoSignupUseCase {
  constructor(
    @Inject(AZEYO_USER_REPOSITORY)
    private readonly userRepository: IAzeyoUserRepository,
    // ... 필요한 도메인 인터페이스만 주입
  ) {}

  async execute(command: AzeyoSignupCommand): Promise<AzeyoAuth> {
    // 단일 기능 수행
  }
}
```

### Controller에서 사용

```typescript
@RestApiController('/azeyo/auths', 'Azeyo Auth')
export class AzeyoAuthController {
  constructor(
    private readonly signupUseCase: AzeyoSignupUseCase,
    private readonly snsLoginUseCase: AzeyoSnsLoginUseCase,
  ) {}

  @RestApiPost(...)
  async signup(@Body() request: AzeyoSignupRequest) {
    return await this.signupUseCase.execute(request.toCommand());
  }
}
```

### Module 등록

```typescript
providers: [
  AzeyoSignupUseCase,
  AzeyoSnsLoginUseCase,
  { provide: MY_REPOSITORY, useClass: MyRepository },
],
```

---

## 새 도메인 추가 절차

### 1. 디렉토리 생성

```bash
mkdir -p src/azeyo/{새도메인}/{presentation/{controller,dto/{request,response}},application/{usecase,command},domain/{entity,repository,exception},infrastructure/repository}
```

### 2. Domain 레이어 먼저 작성

- `domain/entity/` — TypeORM 엔티티
- `domain/repository/` — `Symbol` + `interface` 정의
- `domain/exception/` — 커스텀 HttpException

### 3. Infrastructure 레이어 작성

- `infrastructure/repository/` — 리포지토리 구현체 (`implements I...Repository`)

### 4. Application 레이어 작성

- `application/command/` — 커맨드 객체
- `application/usecase/` — UseCase 클래스 (1클래스 = 1기능, `execute()`)

### 5. Presentation 레이어 작성

- `presentation/dto/request/` — 요청 DTO (`toCommand()` 메서드)
- `presentation/dto/response/` — 응답 DTO
- `presentation/controller/` — `@RestApiController` 컨트롤러

### 6. Module 작성 + 등록

```typescript
@Module({
  imports: [TypeOrmModule.forFeature([MyEntity]), OtherDomainModule],
  controllers: [MyController],
  providers: [
    MyCreateUseCase,
    MyGetUseCase,
    { provide: MY_REPOSITORY, useClass: MyRepository },
  ],
  exports: [MY_REPOSITORY], // 다른 도메인에서 사용할 경우
})
export class MyModule {}
```

`azeyo.module.ts`에 import 추가:
```typescript
@Module({
  imports: [..., MyModule],
})
export class AzeyoModule {}
```

`app.module.ts`에 엔티티 추가:
```typescript
const entities = [..., MyEntity];
```

---

## 현재 도메인 목록

### auth — 인증
- **presentation**: 회원가입, 소셜 로그인, 토큰 재발급 API
- **application**:
  - `AzeyoSignupUseCase` — SNS 토큰 검증 + 유저 생성 + 자동 일정 생성 + 알림 설정(`AzeyoNotificationSetting`) 기본값 생성 + 토큰 발급 + 환영 알림톡 발송(`SIGNUP_WELCOME`)
  - `AzeyoSnsLoginUseCase` — SNS 토큰으로 기존 유저 로그인
  - `AzeyoRefreshTokensUseCase` — access/refresh 토큰 재발급
- **domain**: `AzeyoAuth` 엔티티, `IAzeyoAuthRepository`, 인증 예외
- **infrastructure**: `AzeyoAuthRepository` (JWT 토큰 생성 + TypeORM)

### user — 사용자
- **presentation**: 내 프로필 조회/수정, 이달의 활동왕 조회, 내 게시글 조회 API
- **application**:
  - `AzeyoScanMyProfileUseCase` — 내 프로필 조회 (통계 포함: 게시글/좋아요/족보 수)
  - `AzeyoEditProfileUseCase` — 프로필 수정 (닉네임, 한줄소개)
  - `AzeyoScanTopMonthlyUsersUseCase` — 이달의 활동왕 TOP N 조회
  - `AzeyoScanMyPostsUseCase` — 내 게시글 목록 조회 (페이징, 좋아요/댓글/투표 카운트)
- **domain**: `AzeyoUser` 엔티티 (subtitle, activityPoints, monthlyPoints 포함), `IAzeyoUserRepository`, 사용자 예외
- **infrastructure**: `AzeyoUserRepository` (TypeORM)

### sns — 소셜 로그인 외부 API
- **domain**: `IAzeyoSnsClient` 인터페이스, `SnsUserInfo` DTO
- **infrastructure**: `AzeyoSnsClientService` (카카오/네이버/구글 API 호출)

### schedule — 일정
- **presentation**: 일정 CRUD, 태그 조회/생성, 추천 조회 API
- **application**:
  - `AzeyoCreateScheduleUseCase` — 일정 등록 (태그 연결)
  - `AzeyoScanSchedulesUseCase` — 내 일정 목록 조회
  - `AzeyoDeleteScheduleUseCase` — 일정 삭제
  - `AzeyoScanScheduleTagsUseCase` — 시스템 + 커스텀 태그 목록 조회
  - `AzeyoCreateScheduleTagUseCase` — 커스텀 태그 생성
  - `AzeyoScanScheduleRecommendationsUseCase` — 태그 기반 추천 조회
- **domain**: `AzeyoSchedule`, `AzeyoScheduleTag`, `AzeyoScheduleRecommendation` 엔티티, 리포지토리 인터페이스, 일정 예외
- **infrastructure**: `AzeyoScheduleRepository`, `AzeyoScheduleTagRepository`, `AzeyoScheduleRecommendationRepository` (TypeORM)

### jokbo — 족보 (메시지 템플릿)
- **presentation**: 족보 목록 조회, 내 족보 조회, 족보 등록/삭제, 좋아요, 복사 카운트 API
- **application**:
  - `AzeyoCreateJokboTemplateUseCase` — 족보 등록
  - `AzeyoScanJokboTemplatesUseCase` — 카테고리별 족보 목록 조회 (좋아요순 정렬, 페이징)
  - `AzeyoScanMyJokboTemplatesUseCase` — 내가 올린 족보 조회
  - `AzeyoLikeJokboTemplateUseCase` — 족보 좋아요/취소
  - `AzeyoCopyJokboTemplateUseCase` — 족보 복사 카운트 증가
  - `AzeyoDeleteJokboTemplateUseCase` — 족보 삭제
- **domain**: `AzeyoJokboTemplate` 엔티티, `AzeyoJokboLike` 엔티티, `IAzeyoJokboTemplateRepository`, `IAzeyoJokboLikeRepository`, 족보 예외
- **infrastructure**: `AzeyoJokboTemplateRepository`, `AzeyoJokboLikeRepository` (TypeORM)

### admin — 관리자
- **presentation**: 유저 목록 조회, 대리 게시글/댓글 작성, 게시글 수정/삭제, 전체 게시글 조회 API (`isAdmin` 체크)
- 대리 게시글/댓글은 `AzeyoCreateCommunityPostUseCase` / `AzeyoCreateCommunityCommentUseCase`를 경유하여 일반 글쓰기와 동일하게 포인트 지급 및 알림톡 발송 처리됨

---

## 네이밍 컨벤션

| 항목 | 패턴 | 예시 |
|------|------|------|
| 엔티티 | `Azeyo{Name}` | `AzeyoUser`, `AzeyoAuth` |
| 리포지토리 인터페이스 | `IAzeyo{Name}Repository` | `IAzeyoUserRepository` |
| 리포지토리 토큰 | `AZEYO_{NAME}_REPOSITORY` | `AZEYO_USER_REPOSITORY` |
| 서비스 인터페이스 | `IAzeyo{Name}` | `IAzeyoSnsClient` |
| 서비스 토큰 | `AZEYO_{NAME}` | `AZEYO_SNS_CLIENT` |
| 리포지토리 구현체 | `Azeyo{Name}Repository` | `AzeyoUserRepository` |
| 서비스 구현체 | `Azeyo{Name}Service` | `AzeyoSnsClientService` |
| **UseCase** | `Azeyo{Action}UseCase` | `AzeyoSignupUseCase` |
| **UseCase 파일** | `azeyo-{action}.usecase.ts` | `azeyo-signup.usecase.ts` |
| 컨트롤러 | `Azeyo{Name}Controller` | `AzeyoAuthController` |
| 요청 DTO | `Azeyo{Action}Request` | `AzeyoSignupRequest` |
| 응답 DTO | `Azeyo{Name}Response` | `AzeyoAuthTokensResponse` |
| 커맨드 | `Azeyo{Action}Command` | `AzeyoSignupCommand` |
| 예외 | `Azeyo{Description}` | `AzeyoUserNotFound` |
| 에러코드 | `AZEYO-{DOMAIN}-{NNN}` | `AZEYO-AUTH-001` |
| API 경로 | `/azeyo/{domain}/...` | `/azeyo/auths/sign-up` |
| DB 테이블 | `azeyo_{name}s` | `azeyo_users`, `azeyo_auths` |
| 모듈 클래스 | `Azeyo{Name}Module` | `AzeyoAuthModule` |

---

## 현재 파일 구조

```
src/azeyo/
├── azeyo.module.ts
├── AZEYO-ARCHITECTURE.md
│
├── auth/
│   ├── azeyo-auth.module.ts
│   ├── presentation/
│   │   ├── controller/azeyo-auth.controller.ts
│   │   └── dto/
│   │       ├── request/
│   │       │   ├── azeyo-signup.request.ts
│   │       │   ├── azeyo-sns-login.request.ts
│   │       │   └── azeyo-refresh-tokens.request.ts
│   │       └── response/
│   │           └── azeyo-auth-tokens.response.ts
│   ├── application/
│   │   ├── usecase/
│   │   │   ├── azeyo-signup.usecase.ts
│   │   │   ├── azeyo-sns-login.usecase.ts
│   │   │   └── azeyo-refresh-tokens.usecase.ts
│   │   └── command/
│   │       └── azeyo-signup.command.ts
│   ├── domain/
│   │   ├── entity/azeyo-auth.entity.ts
│   │   ├── repository/azeyo-auth.repository.interface.ts
│   │   └── exception/azeyo-auth.exception.ts
│   └── infrastructure/
│       └── repository/azeyo-auth.repository.ts
│
├── user/
│   ├── azeyo-user.module.ts
│   ├── domain/
│   │   ├── entity/azeyo-user.entity.ts
│   │   ├── repository/azeyo-user.repository.interface.ts
│   │   └── exception/azeyo-user.exception.ts
│   └── infrastructure/
│       └── repository/azeyo-user.repository.ts
│
├── schedule/
│   ├── azeyo-schedule.module.ts
│   ├── presentation/
│   │   ├── controller/azeyo-schedule.controller.ts
│   │   └── dto/
│   │       ├── request/
│   │       │   ├── azeyo-create-schedule.request.ts
│   │       │   └── azeyo-create-schedule-tag.request.ts
│   │       └── response/
│   │           ├── azeyo-schedule.response.ts
│   │           └── azeyo-schedule-recommendation.response.ts
│   ├── application/
│   │   ├── usecase/
│   │   │   ├── azeyo-create-schedule.usecase.ts
│   │   │   ├── azeyo-scan-schedules.usecase.ts
│   │   │   ├── azeyo-delete-schedule.usecase.ts
│   │   │   ├── azeyo-scan-schedule-tags.usecase.ts
│   │   │   ├── azeyo-create-schedule-tag.usecase.ts
│   │   │   └── azeyo-scan-schedule-recommendations.usecase.ts
│   │   └── command/
│   │       └── azeyo-create-schedule.command.ts
│   ├── domain/
│   │   ├── entity/
│   │   │   ├── azeyo-schedule.entity.ts
│   │   │   ├── azeyo-schedule-tag.entity.ts
│   │   │   └── azeyo-schedule-recommendation.entity.ts
│   │   ├── repository/
│   │   │   ├── azeyo-schedule.repository.interface.ts
│   │   │   ├── azeyo-schedule-tag.repository.interface.ts
│   │   │   └── azeyo-schedule-recommendation.repository.interface.ts
│   │   └── exception/azeyo-schedule.exception.ts
│   └── infrastructure/
│       └── repository/
│           ├── azeyo-schedule.repository.ts
│           ├── azeyo-schedule-tag.repository.ts
│           └── azeyo-schedule-recommendation.repository.ts
│
├── sns/
│   ├── azeyo-sns.module.ts
│   ├── domain/
│   │   ├── dto/sns-user-info.ts
│   │   └── service/azeyo-sns-client.interface.ts
│   └── infrastructure/
│       └── service/azeyo-sns-client.service.ts
│
└── jokbo/
    ├── azeyo-jokbo.module.ts
    ├── presentation/
    │   ├── controller/azeyo-jokbo.controller.ts
    │   └── dto/
    │       ├── request/
    │       │   ├── azeyo-create-jokbo-template.request.ts
    │       │   └── azeyo-scan-jokbo-templates.request.ts
    │       └── response/
    │           └── azeyo-jokbo-template.response.ts
    ├── application/
    │   ├── usecase/
    │   │   ├── azeyo-create-jokbo-template.usecase.ts
    │   │   ├── azeyo-scan-jokbo-templates.usecase.ts
    │   │   ├── azeyo-scan-my-jokbo-templates.usecase.ts
    │   │   ├── azeyo-like-jokbo-template.usecase.ts
    │   │   ├── azeyo-copy-jokbo-template.usecase.ts
    │   │   └── azeyo-delete-jokbo-template.usecase.ts
    │   └── command/
    │       └── azeyo-create-jokbo-template.command.ts
    ├── domain/
    │   ├── entity/
    │   │   ├── azeyo-jokbo-template.entity.ts
    │   │   └── azeyo-jokbo-like.entity.ts
    │   ├── repository/
    │   │   ├── azeyo-jokbo-template.repository.interface.ts
    │   │   └── azeyo-jokbo-like.repository.interface.ts
    │   └── exception/azeyo-jokbo.exception.ts
    └── infrastructure/
        └── repository/
            ├── azeyo-jokbo-template.repository.ts
            └── azeyo-jokbo-like.repository.ts
```
