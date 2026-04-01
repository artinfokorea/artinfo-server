import { HttpException, HttpStatus } from '@nestjs/common';

export class AzeyoUserNotFound extends HttpException {
  constructor() {
    super(
      {
        code: 'AZEYO-USER-001',
        message: '사용자를 찾을 수 없습니다.',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class AzeyoNicknameAlreadyExist extends HttpException {
  constructor() {
    super(
      {
        code: 'AZEYO-USER-002',
        message: '이미 사용중인 닉네임입니다.',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
