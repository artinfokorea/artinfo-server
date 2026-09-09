import { HttpException, HttpStatus } from '@nestjs/common';

export class SalpyeoInvalidSnsToken extends HttpException {
  constructor() {
    super(
      {
        code: 'SALPYEO-AUTH-001',
        message: '소셜 로그인 토큰이 올바르지 않습니다.',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class SalpyeoAuthNotFound extends HttpException {
  constructor() {
    super(
      {
        code: 'SALPYEO-AUTH-002',
        message: '로그인 정보가 존재하지 않습니다.',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class SalpyeoFailedToRenewToken extends HttpException {
  constructor() {
    super(
      {
        code: 'SALPYEO-AUTH-003',
        message: '토큰 갱신에 실패했습니다.',
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}
