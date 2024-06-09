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

export class InvalidPhoneNumber extends HttpException {
  constructor() {
    super(
      {
        code: 'USER-002',
        message: '휴대폰 번호가 올바르지 않습니다.',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}
