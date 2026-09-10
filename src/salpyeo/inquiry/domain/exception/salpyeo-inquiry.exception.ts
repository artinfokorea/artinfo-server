import { HttpException, HttpStatus } from '@nestjs/common';

export class SalpyeoInquiryInvalidImage extends HttpException {
  constructor() {
    super({ code: 'SALPYEO-INQUIRY-001', message: '이미지 파일(jpg·png·webp)만 첨부할 수 있어요.' }, HttpStatus.BAD_REQUEST);
  }
}

export class SalpyeoInquiryNotFound extends HttpException {
  constructor() {
    super({ code: 'SALPYEO-INQUIRY-002', message: '문의를 찾을 수 없어요.' }, HttpStatus.NOT_FOUND);
  }
}
