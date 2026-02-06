import { HttpException, HttpStatus } from '@nestjs/common';

export class AdmissionGptExtractionFailed extends HttpException {
  constructor(message?: string) {
    super(
      {
        code: 'ADMISSION-001',
        message: message || 'GPT 입시 정보 추출에 실패했습니다.',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class AdmissionPdfRequired extends HttpException {
  constructor() {
    super(
      {
        code: 'ADMISSION-002',
        message: 'PDF 파일이 필요합니다.',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class AdmissionCreationFailed extends HttpException {
  constructor() {
    super(
      {
        code: 'ADMISSION-003',
        message: '입시 정보 저장에 실패했습니다.',
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
