import { HttpException, HttpStatus } from '@nestjs/common';

export class OnchurchChurchSlugAlreadyTaken extends HttpException {
  constructor() {
    super(
      {
        code: 'ONCHURCH-CHURCH-001',
        message: '이미 사용 중인 서브도메인입니다.',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class OnchurchChurchNotFound extends HttpException {
  constructor() {
    super(
      {
        code: 'ONCHURCH-CHURCH-002',
        message: '교회 정보를 찾을 수 없습니다.',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}
