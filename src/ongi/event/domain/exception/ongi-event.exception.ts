import { HttpException, HttpStatus } from '@nestjs/common';

export class OngiEventNotFound extends HttpException {
  constructor() {
    super({ code: 'ONGI-EVENT-001', message: '일정을 찾을 수 없어요.' }, HttpStatus.NOT_FOUND);
  }
}

export class OngiInvalidEventDate extends HttpException {
  constructor() {
    super({ code: 'ONGI-EVENT-002', message: '날짜를 확인해 주세요.' }, HttpStatus.BAD_REQUEST);
  }
}

export class OngiNotEventEditor extends HttpException {
  constructor() {
    super({ code: 'ONGI-EVENT-003', message: '일정을 만든 사람이나 관리자만 수정할 수 있어요.' }, HttpStatus.FORBIDDEN);
  }
}
