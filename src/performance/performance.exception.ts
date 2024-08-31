import { HttpException, HttpStatus } from '@nestjs/common';

export class PerformanceNotFound extends HttpException {
  constructor() {
    super(
      {
        code: 'Performance-001',
        message: '공연이 존재하지 않습니다.',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}
