import { HttpException, HttpStatus } from '@nestjs/common';

export class OngiInvalidSnsToken extends HttpException {
  constructor() {
    super(
      {
        code: 'ONGI-AUTH-001',
        message: 'SNS 로그인 토큰이 올바르지 않습니다.',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class OngiSnsTokenRequired extends HttpException {
  constructor() {
    super(
      {
        code: 'ONGI-AUTH-002',
        message: 'SNS 로그인 토큰이 필요합니다.',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class OngiAuthNotFound extends HttpException {
  constructor() {
    super(
      {
        code: 'ONGI-AUTH-003',
        message: '로그인 정보가 존재하지 않습니다.',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class OngiFailedToRenewToken extends HttpException {
  constructor() {
    super(
      {
        code: 'ONGI-AUTH-004',
        message: '토큰 갱신에 실패했습니다.',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
