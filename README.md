<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ yarn install
```

## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Test

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).

## HWP → PNG 변환 (`/hwp-converter`)

macOS 에 설치된 **Polaris Office** 를 GUI 자동화로 구동해 HWP/HWPX 를 페이지별 PNG 로 내보낸다.
Polaris 는 CLI·AppleScript·URL 스킴 변환 인터페이스가 없어 Backstage "파일 → 내보내기 → PNG 이미지(.png)" UI 를 눌러 준다.
따라서 **Polaris 가 설치된 Mac 의 로그인 GUI 세션에서 서버를 띄웠을 때만** 동작하고, 그 외(리눅스 Docker 등)에서는 503 `HWP-CONVERT-001` 을 돌려준다.

| 엔드포인트 | 설명 |
|---|---|
| `POST /hwp-converter/png` (multipart `file`, 관리자) | 기본 JSON(모든 페이지 base64). `?format=png&page=N` 이면 PNG 바이너리 + `X-Page-Count` 헤더 |
| `GET /hwp-converter/doctor` (관리자) | macOS · Polaris 설치 · `bin/axclick` 빌드 · 보조 접근 권한 점검 |

준비 (Mac 에서 1회)

```bash
pnpm run build:axclick   # tools/axclick.swift → bin/axclick (CGEvent 마우스 클릭 도우미, swiftc 필요)
# 시스템 설정 → 개인정보 보호 및 보안 → 손쉬운 사용 에서 서버를 실행하는 앱(터미널 또는 node)을 허용
```

환경 변수: `HWP_CONVERTER_WORK_DIR`, `POLARIS_APP`, `POLARIS_EDITOR_PROCESS`, `HWP_CONVERTER_SCRIPTS_DIR`, `HWP_CONVERTER_AXCLICK`,
`HWP_CONVERTER_OPEN_TIMEOUT_MS`(45000), `HWP_CONVERTER_EXPORT_TIMEOUT_MS`(120000), `HWP_CONVERTER_CLEANUP`(true).

동작 원리·실측 메모는 `src/hwp-converter/service/polaris-driver.ts` 상단 주석 참고. 출력은 A4 기준 793×1122 px(96 dpi), 9 페이지 문서 약 50 초, 요청은 직렬 큐로 한 번에 하나.
키 입력(keystroke)은 쓰지 않는다 — Editor 가 종료되는 순간 키 입력이 다른 앱으로 전달되기 때문. 모든 조작은 요소 클릭으로만 한다.
