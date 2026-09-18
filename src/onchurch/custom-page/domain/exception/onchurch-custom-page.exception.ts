import { HttpException, HttpStatus } from '@nestjs/common';

export class OnchurchCustomPageNotFound extends HttpException {
  constructor() {
    super({ code: 'ONCHURCH-CUSTOM-PAGE-001', message: '페이지를 찾을 수 없습니다.' }, HttpStatus.NOT_FOUND);
  }
}

export class OnchurchCustomPageChurchNotConfigured extends HttpException {
  constructor() {
    super({ code: 'ONCHURCH-CUSTOM-PAGE-002', message: '교회 정보를 먼저 등록해주세요.' }, HttpStatus.BAD_REQUEST);
  }
}

export class OnchurchCustomPageSlugDuplicated extends HttpException {
  constructor() {
    super({ code: 'ONCHURCH-CUSTOM-PAGE-003', message: '이미 사용 중인 주소입니다.' }, HttpStatus.CONFLICT);
  }
}

export class OnchurchCustomPageSlugReserved extends HttpException {
  constructor() {
    super({ code: 'ONCHURCH-CUSTOM-PAGE-004', message: '사용할 수 없는 주소입니다.' }, HttpStatus.BAD_REQUEST);
  }
}
