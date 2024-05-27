import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidAccessToken extends HttpException {
  constructor() {
    super(
      {
        code: 'AUTH-001',
        message: '접근 토큰이 올바르지 않습니다.',
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}

export class Unauthorized extends HttpException {
  constructor() {
    super(
      {
        code: 'AUTH-002',
        message: '권한이 없습니다.',
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}

export class EmailAlreadyExist extends HttpException {
  constructor() {
    super(
      {
        code: 'AUTH-003',
        message: '해당 이메일이 이미 존재합니다.',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class InvalidLoginInfo extends HttpException {
  constructor() {
    super(
      {
        code: 'AUTH-004',
        message: '로그인 정보가 올바르지 않습니다.',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
