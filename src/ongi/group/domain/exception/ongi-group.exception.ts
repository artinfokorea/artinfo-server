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

export class OngiCannotBlockSelf extends HttpException {
  constructor() {
    super(
      {
        code: 'ONGI-GROUP-006',
        message: '자기 자신은 차단할 수 없어요.',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class OngiNotGroupAdmin extends HttpException {
  constructor() {
    super(
      {
        code: 'ONGI-GROUP-007',
        message: '관리자만 할 수 있어요.',
      },
      HttpStatus.FORBIDDEN,
    );
  }
}

export class OngiCannotRemoveMember extends HttpException {
  constructor() {
    super(
      {
        code: 'ONGI-GROUP-008',
        message: '본인이나 다른 관리자는 내보낼 수 없어요.',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
