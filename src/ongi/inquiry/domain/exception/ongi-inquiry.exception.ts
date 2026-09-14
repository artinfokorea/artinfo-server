import { HttpException, HttpStatus } from '@nestjs/common';

export class OngiInquiryInvalidContent extends HttpException {
  constructor() {
    super({ code: 'ONGI-INQUIRY-001', message: '문의 내용을 1~2000자로 입력해 주세요.' }, HttpStatus.BAD_REQUEST);
  }
}
