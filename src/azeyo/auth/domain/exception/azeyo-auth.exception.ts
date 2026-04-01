import { HttpException, HttpStatus } from '@nestjs/common';

export class AzeyoInvalidSnsToken extends HttpException {
  constructor() {
    super(
      {
        code: 'AZEYO-AUTH-001',
        message: 'SNS 로그인 토큰이 올바르지 않습니다.',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class AzeyoAuthNotFound extends HttpException {
  constructor() {
    super(
      {
        code: 'AZEYO-AUTH-002',
        message: '로그인 정보가 존재하지 않습니다.',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class AzeyoFailedToRenewToken extends HttpException {
  constructor() {
    super(
      {
        code: 'AZEYO-AUTH-003',
        message: '토큰 갱신에 실패했습니다.',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class AzeyoInvalidAccessToken extends HttpException {
  constructor() {
    super(
      {
        code: 'AZEYO-AUTH-004',
        message: '접근 토큰이 올바르지 않습니다.',
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}

export class AzeyoUserNotRegistered extends HttpException {
  constructor() {
    super(
      {
        code: 'AZEYO-AUTH-005',
        message: '가입되지 않은 사용자입니다. 회원가입을 진행해주세요.',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}
