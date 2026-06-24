import { HttpException, HttpStatus } from '@nestjs/common';

export class OnchurchSaintChurchNotConfigured extends HttpException {
  constructor() {
    super(
      {
        code: 'ONCHURCH-SAINT-001',
        message: '교회 정보를 먼저 등록해주세요.',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class OnchurchSaintNotFound extends HttpException {
  constructor() {
    super(
      {
        code: 'ONCHURCH-SAINT-002',
        message: '성도를 찾을 수 없습니다.',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class OnchurchSaintRelationNotFound extends HttpException {
  constructor() {
    super(
      {
        code: 'ONCHURCH-SAINT-003',
        message: '가족관계 항목을 찾을 수 없습니다.',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class OnchurchSaintRelationInvalid extends HttpException {
  constructor(message = '자기 자신과는 가족관계를 설정할 수 없습니다.') {
    super(
      {
        code: 'ONCHURCH-SAINT-004',
        message,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
