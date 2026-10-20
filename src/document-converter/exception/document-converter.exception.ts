import { HttpException, HttpStatus } from '@nestjs/common';

export class DocumentFileRequired extends HttpException {
  constructor() {
    super({ code: 'DOC-CONVERT-001', message: 'multipart 필드 "file" 에 HWP/HWPX/PDF 파일을 첨부하세요.' }, HttpStatus.BAD_REQUEST);
  }
}

export class DocumentUnsupportedFile extends HttpException {
  constructor(message: string) {
    super({ code: 'DOC-CONVERT-002', message }, HttpStatus.BAD_REQUEST);
  }
}

export class DocumentTooManyPages extends HttpException {
  constructor(pageCount: number, maxPages: number) {
    super(
      { code: 'DOC-CONVERT-003', message: `페이지가 너무 많습니다 (${pageCount} 페이지, 최대 ${maxPages}).`, detail: { pageCount, maxPages } },
      HttpStatus.BAD_REQUEST,
    );
  }
}

/** 파일을 열거나 렌더링하지 못함 — 손상되었거나 지원하지 않는 내용 */
export class DocumentParseFailed extends HttpException {
  constructor(message: string, detail?: unknown) {
    super({ code: 'DOC-CONVERT-004', message, detail }, HttpStatus.BAD_REQUEST);
  }
}

/** 변환 도구(poppler · rhwp WASM)를 쓸 수 없음 */
export class DocumentConverterUnavailable extends HttpException {
  constructor(message: string, detail?: unknown) {
    super({ code: 'DOC-CONVERT-005', message, detail }, HttpStatus.SERVICE_UNAVAILABLE);
  }
}

export class DocumentPageNotFound extends HttpException {
  constructor(page: number, pageCount: number) {
    super({ code: 'DOC-CONVERT-006', message: `페이지 ${page} 가 없습니다. 총 ${pageCount} 페이지.` }, HttpStatus.NOT_FOUND);
  }
}

export class DocumentConversionTimeout extends HttpException {
  constructor(stage: string, ms: number) {
    super({ code: 'DOC-CONVERT-007', message: `변환 단계 "${stage}" 가 ${ms}ms 안에 끝나지 않았습니다.`, detail: { stage, ms } }, HttpStatus.GATEWAY_TIMEOUT);
  }
}
