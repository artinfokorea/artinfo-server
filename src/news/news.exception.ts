import { HttpException, HttpStatus } from '@nestjs/common';

export class NewsNotFound extends HttpException {
  constructor() {
    super(
      {
        code: 'NEWS-001',
        message: '뉴스가 존재하지 않습니다.',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}
