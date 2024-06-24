import { HttpException, HttpStatus } from '@nestjs/common';

export class MajorNotFound extends HttpException {
  constructor() {
    super(
      {
        code: 'MAJOR-001',
        message: '전공이 존재하지 않습니다.',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}
