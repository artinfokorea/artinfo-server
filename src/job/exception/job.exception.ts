import { HttpException, HttpStatus } from '@nestjs/common';

export class JobNotFound extends HttpException {
  constructor() {
    super(
      {
        code: 'JOB-001',
        message: '채용이 존재하지 않습니다.',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}
