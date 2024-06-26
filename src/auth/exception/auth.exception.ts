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

export class EmailAuthenticationDoesNotExist extends HttpException {
  constructor() {
    super(
      {
        code: 'AUTH-004',
        message: '해당 이메일에 대한 인증이 존재하지 않습니다.',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class InvalidLoginInfo extends HttpException {
  constructor() {
    super(
      {
        code: 'AUTH-005',
        message: '로그인 정보가 올바르지 않습니다.',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class PasswordNotFound extends HttpException {
  constructor() {
    super(
      {
        code: 'AUTH-006',
        message: '패스워드가 존재하지 않습니다.',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class KakaoAccessTokenIsNotValid extends HttpException {
  constructor() {
    super(
      {
        code: 'AUTH-007',
        message: '카카오 로그인 토큰 정보가 올바르지 않습니다.',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class GoogleAccessTokenIsNotValid extends HttpException {
  constructor() {
    super(
      {
        code: 'AUTH-008',
        message: '구글 로그인 토큰 정보가 올바르지 않습니다.',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class NaverAccessTokenIsNotValid extends HttpException {
  constructor() {
    super(
      {
        code: 'AUTH-009',
        message: '네이버 로그인 토큰 정보가 올바르지 않습니다.',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class FailedToRenewToken extends HttpException {
  constructor() {
    super(
      {
        code: 'AUTH-010',
        message: '토큰 갱신에 실패했습니다.',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class AuthNotFound extends HttpException {
  constructor() {
    super(
      {
        code: 'AUTH-011',
        message: '로그인 정보가 존재하지 않습니다.',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}
