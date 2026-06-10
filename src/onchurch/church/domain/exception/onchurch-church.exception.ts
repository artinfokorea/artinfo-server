import { HttpException, HttpStatus } from '@nestjs/common';

export class OnchurchChurchSlugAlreadyTaken extends HttpException {
  constructor() {
    super(
      {
        code: 'ONCHURCH-CHURCH-001',
        message: '이미 사용 중인 서브도메인입니다.',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class OnchurchChurchNotFound extends HttpException {
  constructor() {
    super(
      {
        code: 'ONCHURCH-CHURCH-002',
        message: '교회 정보를 찾을 수 없습니다.',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class OnchurchChurchRequiredFieldsMissing extends HttpException {
  constructor() {
    super(
      {
        code: 'ONCHURCH-CHURCH-003',
        message: '필수 항목(기본정보·연락처·교회 소개·예배 안내)이 모두 입력되어야 사이트를 운영할 수 있습니다.',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class OnchurchSubscriptionRequired extends HttpException {
  constructor() {
    super(
      {
        code: 'ONCHURCH-CHURCH-004',
        message: '결제 또는 무료 체험이 필요합니다.',
      },
      HttpStatus.PAYMENT_REQUIRED,
    );
  }
}

export class OnchurchChurchManagementForbidden extends HttpException {
  constructor() {
    super(
      {
        code: 'ONCHURCH-CHURCH-005',
        message: '교회를 관리할 권한이 없습니다.',
      },
      HttpStatus.FORBIDDEN,
    );
  }
}

export class OnchurchOwnerGradeImmutable extends HttpException {
  constructor() {
    super(
      {
        code: 'ONCHURCH-CHURCH-006',
        message: '오너 등급은 변경하거나 삭제할 수 없습니다.',
      },
      HttpStatus.FORBIDDEN,
    );
  }
}
