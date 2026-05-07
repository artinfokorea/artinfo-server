import { HttpException, HttpStatus } from '@nestjs/common';

export class OnchurchTransportationNotFound extends HttpException {
  constructor() {
    super(
      {
        code: 'ONCHURCH-TRANSPORTATION-001',
        message: '교통편을 찾을 수 없습니다.',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class OnchurchTransportationChurchNotConfigured extends HttpException {
  constructor() {
    super(
      {
        code: 'ONCHURCH-TRANSPORTATION-002',
        message: '교회 정보를 먼저 등록해주세요.',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
