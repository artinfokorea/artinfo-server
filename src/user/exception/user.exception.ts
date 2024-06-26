import { HttpException, HttpStatus } from '@nestjs/common';

export class UserNotFound extends HttpException {
  constructor() {
    super(
      {
        code: 'USER-001',
        message: '유저가 존재하지 않습니다.',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class InvalidPhoneNumber extends HttpException {
  constructor() {
    super(
      {
        code: 'USER-002',
        message: '유효하지 않은 연락처입니다.',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class UserPhoneNotFound extends HttpException {
  constructor() {
    super(
      {
        code: 'USER-003',
        message: '연락처가 존재하지 않습니다.',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class UnableToDeleteMajor extends HttpException {
  constructor() {
    super(
      {
        code: 'USER-004',
        message: '레슨이 존재하여 전공을 삭제할 수 없습니다.',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
