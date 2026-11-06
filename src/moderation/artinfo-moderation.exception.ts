import { HttpException, HttpStatus } from '@nestjs/common';

export class CannotBlockYourself extends HttpException {
  constructor() {
    super({ code: 'MOD-001', message: '자기 자신은 차단할 수 없습니다.' }, HttpStatus.BAD_REQUEST);
  }
}
