import { HttpException, HttpStatus } from '@nestjs/common';

export class OnchurchInquiryNotFound extends HttpException {
  constructor() {
    super({ code: 'ONCHURCH-INQUIRY-001', message: '문의를 찾을 수 없습니다.' }, HttpStatus.NOT_FOUND);
  }
}
