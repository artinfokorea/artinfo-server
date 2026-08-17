import { HttpException, HttpStatus } from '@nestjs/common';

export class OngiUserNotFound extends HttpException {
  constructor() {
    super(
      {
        code: 'ONGI-USER-001',
        message: '사용자를 찾을 수 없어요.',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}
