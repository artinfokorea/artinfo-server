import { HttpException, HttpStatus } from '@nestjs/common';

export class OnchurchWorshipChurchNotConfigured extends HttpException {
  constructor() {
    super(
      {
        code: 'ONCHURCH-WORSHIP-001',
        message: '교회 정보를 먼저 등록해주세요.',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class OnchurchWorshipServiceNotFound extends HttpException {
  constructor() {
    super(
      {
        code: 'ONCHURCH-WORSHIP-002',
        message: '예배 항목을 찾을 수 없습니다.',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class OnchurchWorshipOrderNotFound extends HttpException {
  constructor() {
    super(
      {
        code: 'ONCHURCH-WORSHIP-003',
        message: '예배 순서 항목을 찾을 수 없습니다.',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}
