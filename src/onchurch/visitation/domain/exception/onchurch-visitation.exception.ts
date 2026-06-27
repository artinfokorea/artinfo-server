import { HttpException, HttpStatus } from '@nestjs/common';

export class OnchurchVisitationChurchNotConfigured extends HttpException {
  constructor() {
    super(
      {
        code: 'ONCHURCH-VISITATION-001',
        message: '교회 정보를 먼저 등록해주세요.',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class OnchurchVisitationNotFound extends HttpException {
  constructor() {
    super(
      {
        code: 'ONCHURCH-VISITATION-002',
        message: '심방 기록을 찾을 수 없습니다.',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class OnchurchVisitationTypeNotFound extends HttpException {
  constructor() {
    super(
      {
        code: 'ONCHURCH-VISITATION-003',
        message: '심방 종류를 찾을 수 없습니다.',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class OnchurchVisitationTypeDuplicated extends HttpException {
  constructor() {
    super(
      {
        code: 'ONCHURCH-VISITATION-004',
        message: '이미 등록된 심방 종류입니다.',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
