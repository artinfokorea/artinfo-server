import { HttpException, HttpStatus } from '@nestjs/common';

export class UserNotFound extends HttpException {
  constructor() {
    super(
      {
        code: 'USER-001',
        message: '유저가 존재하지 않습니다.',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}
