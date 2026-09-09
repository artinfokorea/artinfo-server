import { HttpException, HttpStatus } from '@nestjs/common';

export class SalpyeoUserNotFound extends HttpException {
  constructor() {
    super(
      {
        code: 'SALPYEO-USER-001',
        message: '사용자를 찾을 수 없습니다.',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}
