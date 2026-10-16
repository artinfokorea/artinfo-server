import { HttpException, HttpStatus } from '@nestjs/common';

/** Polaris Office 가 없거나(비 macOS) 보조 접근 권한·axclick 이 없어 변환을 수행할 수 없음 */
export class HwpConverterUnavailable extends HttpException {
  constructor(message: string, detail?: unknown) {
    super({ code: 'HWP-CONVERT-001', message, detail }, HttpStatus.SERVICE_UNAVAILABLE);
  }
}

export class HwpUnsupportedFile extends HttpException {
  constructor(message: string) {
    super({ code: 'HWP-CONVERT-002', message }, HttpStatus.BAD_REQUEST);
  }
}

/** GUI 자동화 실패. detail 에 진행 단계(steps)·그 시점의 UI 트리(uiDump) 가 담긴다. */
export class HwpConversionFailed extends HttpException {
  constructor(message: string, detail?: unknown) {
    super({ code: 'HWP-CONVERT-003', message, detail }, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

export class HwpFileRequired extends HttpException {
  constructor() {
    super({ code: 'HWP-CONVERT-004', message: 'multipart 필드 "file" 에 HWP 파일을 첨부하세요.' }, HttpStatus.BAD_REQUEST);
  }
}

export class HwpPageNotFound extends HttpException {
  constructor(page: number, pageCount: number) {
    super({ code: 'HWP-CONVERT-005', message: `페이지 ${page} 가 없습니다. 총 ${pageCount} 페이지.` }, HttpStatus.NOT_FOUND);
  }
}

export class HwpConversionTimeout extends HttpException {
  constructor(stage: string, ms: number) {
    super({ code: 'HWP-CONVERT-006', message: `변환 단계 "${stage}" 가 ${ms}ms 안에 끝나지 않았습니다.`, detail: { stage, ms } }, HttpStatus.GATEWAY_TIMEOUT);
  }
}
