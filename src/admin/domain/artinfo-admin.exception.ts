import { HttpException, HttpStatus } from '@nestjs/common';

export class ArtinfoAdminForbidden extends HttpException {
  constructor() {
    super({ code: 'ADMIN-001', message: '관리자만 사용할 수 있습니다.' }, HttpStatus.FORBIDDEN);
  }
}
