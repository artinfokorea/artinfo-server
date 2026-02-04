import { HttpException, HttpStatus } from '@nestjs/common';

export class FileConversionFailed extends HttpException {
  constructor(message?: string) {
    super(
      {
        code: 'FILE-CONVERT-001',
        message: message || '파일 변환에 실패했습니다.',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class UnsupportedFileType extends HttpException {
  constructor() {
    super(
      {
        code: 'FILE-CONVERT-002',
        message: '지원하지 않는 파일 형식입니다.',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
