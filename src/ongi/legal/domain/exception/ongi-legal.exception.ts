import { HttpException, HttpStatus } from '@nestjs/common';

export class OngiLegalDocNotFound extends HttpException {
  constructor() {
    super(
      {
        code: 'ONGI-LEGAL-001',
        message: '문서를 찾을 수 없어요.',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}
