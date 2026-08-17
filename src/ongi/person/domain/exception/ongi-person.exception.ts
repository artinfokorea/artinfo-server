import { HttpException, HttpStatus } from '@nestjs/common';

export class OngiPersonNotFound extends HttpException {
  constructor() {
    super(
      {
        code: 'ONGI-PERSON-001',
        message: '인물을 찾을 수 없어요.',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}
