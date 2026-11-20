import { HttpException, HttpStatus } from '@nestjs/common';

export class OnchurchAppStoreUrlInvalid extends HttpException {
  constructor() {
    super({ code: 'ONCHURCH-APPVER-001', message: '스토어 주소는 https:// 로 시작하는 주소여야 합니다.' }, HttpStatus.BAD_REQUEST);
  }
}
