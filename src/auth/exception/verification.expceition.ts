import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidVerificationNumber extends HttpException {
  constructor() {
    super(
      {
        code: 'VERIFICATION-001',
        message: '인증 번호가 올바르지 않습니다.',
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}
