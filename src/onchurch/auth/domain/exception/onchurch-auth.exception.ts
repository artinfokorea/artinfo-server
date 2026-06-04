import { HttpException, HttpStatus } from '@nestjs/common';

export class OnchurchUserIdAlreadyExist extends HttpException {
  constructor() {
    super(
      {
        code: 'ONCHURCH-AUTH-001',
        message: '이미 사용 중인 아이디입니다.',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class OnchurchPhoneNotVerified extends HttpException {
  constructor() {
    super(
      {
        code: 'ONCHURCH-AUTH-002',
        message: '휴대폰 인증이 완료되지 않았습니다.',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class OnchurchInvalidVerificationCode extends HttpException {
  constructor() {
    super(
      {
        code: 'ONCHURCH-AUTH-003',
        message: '인증번호가 일치하지 않습니다.',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class OnchurchInvalidCredentials extends HttpException {
  constructor() {
    super(
      {
        code: 'ONCHURCH-AUTH-004',
        message: '아이디 또는 비밀번호가 올바르지 않습니다.',
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}

export class OnchurchInvalidAccessToken extends HttpException {
  constructor() {
    super(
      {
        code: 'ONCHURCH-AUTH-005',
        message: '접근 토큰이 올바르지 않습니다.',
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}

export class OnchurchFailedToRenewToken extends HttpException {
  constructor() {
    super(
      {
        code: 'ONCHURCH-AUTH-006',
        message: '토큰 갱신에 실패했습니다.',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class OnchurchAuthNotFound extends HttpException {
  constructor() {
    super(
      {
        code: 'ONCHURCH-AUTH-007',
        message: '로그인 정보가 존재하지 않습니다.',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class OnchurchNotChurchMember extends HttpException {
  constructor() {
    super(
      {
        code: 'ONCHURCH-AUTH-008',
        message: '이 교회의 계정이 아닙니다. 해당 교회에서 가입한 계정으로 로그인해주세요.',
      },
      HttpStatus.FORBIDDEN,
    );
  }
}
