import { HttpException, HttpStatus } from '@nestjs/common';

export class OnchurchEventNotFound extends HttpException {
  constructor() {
    super(
      {
        code: 'ONCHURCH-EVENT-001',
        message: '일정을 찾을 수 없습니다.',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class OnchurchEventChurchNotConfigured extends HttpException {
  constructor() {
    super(
      {
        code: 'ONCHURCH-EVENT-002',
        message: '교회 정보를 먼저 등록해주세요.',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
