import { HttpException, HttpStatus } from '@nestjs/common';

export class OnchurchPrayerNotFound extends HttpException {
  constructor() {
    super({ code: 'ONCHURCH-PRAYER-001', message: '기도 요청을 찾을 수 없습니다.' }, HttpStatus.NOT_FOUND);
  }
}

export class OnchurchPrayerChurchNotConfigured extends HttpException {
  constructor() {
    super({ code: 'ONCHURCH-PRAYER-002', message: '교회 정보를 먼저 등록해주세요.' }, HttpStatus.BAD_REQUEST);
  }
}

export class OnchurchPrayerChurchNotFound extends HttpException {
  constructor() {
    super({ code: 'ONCHURCH-PRAYER-003', message: '교회를 찾을 수 없습니다.' }, HttpStatus.NOT_FOUND);
  }
}
