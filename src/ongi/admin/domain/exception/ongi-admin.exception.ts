import { HttpException, HttpStatus } from '@nestjs/common';

export class OngiAdminForbidden extends HttpException {
  constructor() {
    super({ code: 'ONGI-ADMIN-001', message: '관리자만 사용할 수 있어요.' }, HttpStatus.FORBIDDEN);
  }
}

export class OngiAdminPermissionDenied extends HttpException {
  constructor() {
    super({ code: 'ONGI-ADMIN-002', message: '이 기능을 쓸 권한이 없어요.' }, HttpStatus.FORBIDDEN);
  }
}

export class OngiAdminNotFound extends HttpException {
  constructor() {
    super({ code: 'ONGI-ADMIN-003', message: '대상을 찾을 수 없어요.' }, HttpStatus.NOT_FOUND);
  }
}

export class OngiAdminInvalidConfig extends HttpException {
  constructor() {
    super({ code: 'ONGI-ADMIN-004', message: '버전은 1.2.3 형식으로 입력해 주세요.' }, HttpStatus.BAD_REQUEST);
  }
}

export class OngiAdminInvalidGrant extends HttpException {
  constructor() {
    super({ code: 'ONGI-ADMIN-005', message: '이 사용자의 등급은 바꿀 수 없어요.' }, HttpStatus.BAD_REQUEST);
  }
}

export class OngiAdminUnsupportedTarget extends HttpException {
  constructor() {
    super({ code: 'ONGI-ADMIN-006', message: '구성원 신고는 삭제할 콘텐츠가 없어요. 사용자 조회에서 확인해 주세요.' }, HttpStatus.BAD_REQUEST);
  }
}
