import { HttpException, HttpStatus } from '@nestjs/common';

export class OngiGroupNotFound extends HttpException {
  constructor() {
    super(
      {
        code: 'ONGI-GROUP-001',
        message: '가족 공간을 찾을 수 없어요.',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class OngiInviteCodeNotFound extends HttpException {
  constructor() {
    super(
      {
        code: 'ONGI-GROUP-002',
        message: '초대 코드를 찾을 수 없어요. 코드를 다시 확인해 주세요.',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class OngiInviteCodeExpired extends HttpException {
  constructor() {
    super(
      {
        code: 'ONGI-GROUP-003',
        message: '초대 코드가 만료됐어요. 가족에게 새 코드를 요청해 주세요.',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class OngiNotGroupMember extends HttpException {
  constructor() {
    super(
      {
        code: 'ONGI-GROUP-004',
        message: '이 가족 공간의 구성원이 아니에요.',
      },
      HttpStatus.FORBIDDEN,
    );
  }
}

export class OngiMemberNotFound extends HttpException {
  constructor() {
    super(
      {
        code: 'ONGI-GROUP-005',
        message: '구성원을 찾을 수 없어요.',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}
