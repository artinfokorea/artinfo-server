---
name: save-admission
description: 추출된 입시 데이터를 ArtInfo API로 저장합니다. "입시 데이터 저장해줘", "API로 보내줘" 등의 요청에 사용합니다.
argument-hint: "[file_path] 또는 [--data '{JSON}']"
disable-model-invocation: true
allowed-tools: Bash, Read
---

# ArtInfo 입시 데이터 API 저장 스킬

추출된 입시 정보를 ArtInfo API(`POST /admissions`)로 저장합니다.

## 스크립트 위치

`.claude/skills/save-admission/scripts/save_admission.py`

## 사용 방법

### 방법 1: 파일에서 저장 (권장)

admission-extractor 에이전트가 저장한 JSON 파일을 발행:

```bash
uv run .claude/skills/save-admission/scripts/save_admission.py --file outputs/admissions/서울대학교_GENERAL_20260307_143052.json
```

### 방법 2: Dry Run (테스트)

실제 저장 없이 확인:

```bash
uv run .claude/skills/save-admission/scripts/save_admission.py --file outputs/admissions/서울대학교_GENERAL_20260307_143052.json --dry-run
```

## 입력: $ARGUMENTS

## API 흐름

### 1단계: 관리자 로그인 (토큰 획득)

```
POST https://api-artinfokorea.com/auths/login/email
{
  "email": "admin@example.com",
  "password": "password"
}
```

응답에서 `accessToken` 획득

### 2단계: 입시 데이터 저장

```
POST https://api-artinfokorea.com/admissions
Headers:
  Authorization: Bearer {accessToken}
  Content-Type: application/json
Body:
{
  "admissions": [ ... ]
}
```

## 스크립트 옵션

| 옵션 | 단축 | 설명 |
|------|------|------|
| `--file` | `-f` | JSON 파일 경로 |
| `--email` | `-e` | 로그인 이메일 (환경변수 ARTINFO_EMAIL) |
| `--password` | `-p` | 로그인 비밀번호 (환경변수 ARTINFO_PASSWORD) |
| `--dry-run` | | 실제 저장 없이 테스트 |

## 환경 변수

```bash
export ARTINFO_EMAIL="your-email@example.com"
export ARTINFO_PASSWORD="your-password"
```

## 출력 형식

### 성공 시
```json
{
  "status": "success",
  "message": "입시 데이터가 성공적으로 저장되었습니다",
  "savedIds": [1, 2, 3],
  "totalMajors": 10
}
```

### 실패 시
```json
{
  "status": "error",
  "message": "오류 메시지"
}
```

## 전체 워크플로우

1. `admission-extractor` 에이전트로 PDF에서 추출 → `outputs/admissions/xxx.json` 저장
2. `/save-admission outputs/admissions/xxx.json` - API 저장