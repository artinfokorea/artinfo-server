import { HttpException, HttpStatus } from '@nestjs/common';

export class OnchurchUserNotFound extends HttpException {
  constructor() {
    super(
      {
        code: 'ONCHURCH-USER-001',
        message: '사용자를 찾을 수 없습니다.',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class OnchurchUserPasswordMismatch extends HttpException {
  constructor() {
    super(
      {
        code: 'ONCHURCH-USER-002',
        message: '현재 비밀번호가 일치하지 않습니다.',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class OnchurchInitialPasswordNotAllowed extends HttpException {
  constructor() {
    super(
      {
        code: 'ONCHURCH-USER-003',
        message: '초기 비밀번호 설정 대상이 아닙니다.',
      },
      HttpStatus.FORBIDDEN,
    );
  }
}
