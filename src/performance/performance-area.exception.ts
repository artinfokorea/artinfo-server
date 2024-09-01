import { HttpException, HttpStatus } from '@nestjs/common';

export class PerformanceAreaNotFound extends HttpException {
  constructor() {
    super(
      {
        code: 'PerformanceArea-001',
        message: '공연장이 존재하지 않습니다.',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}
