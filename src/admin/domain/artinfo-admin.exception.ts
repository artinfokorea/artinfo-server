import { HttpException, HttpStatus } from '@nestjs/common';

export class ArtinfoAdminForbidden extends HttpException {
  constructor() {
    super({ code: 'ADMIN-001', message: '관리자만 사용할 수 있습니다.' }, HttpStatus.FORBIDDEN);
  }
}

export class AdminUserNotFound extends HttpException {
  constructor() {
    super({ code: 'ADMIN-002', message: '회원을 찾을 수 없습니다.' }, HttpStatus.NOT_FOUND);
  }
}

export class AdminSelfActionForbidden extends HttpException {
  constructor() {
    super({ code: 'ADMIN-003', message: '자기 자신에게는 할 수 없습니다.' }, HttpStatus.BAD_REQUEST);
  }
}

export class AdminTargetIsAdmin extends HttpException {
  constructor() {
    super({ code: 'ADMIN-004', message: '관리자 계정은 먼저 일반 회원으로 바꾼 뒤 처리해 주세요.' }, HttpStatus.BAD_REQUEST);
  }
}

export class AdminUserAlreadyWithdrawn extends HttpException {
  constructor() {
    super({ code: 'ADMIN-005', message: '이미 탈퇴한 회원입니다.' }, HttpStatus.BAD_REQUEST);
  }
}
