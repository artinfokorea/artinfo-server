import { HttpException, HttpStatus } from '@nestjs/common';

export class AzeyoScheduleNotFound extends HttpException {
  constructor() {
    super({ code: 'AZEYO-SCHEDULE-001', message: '일정이 존재하지 않습니다.' }, HttpStatus.NOT_FOUND);
  }
}
