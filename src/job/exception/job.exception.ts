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

export class MajorNotFound extends HttpException {
  constructor() {
    super(
      {
        code: 'JOB-002',
        message: '전공이 존재하지 않습니다.',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class JobCreationFailed extends HttpException {
  constructor() {
    super(
      {
        code: 'JOB-003',
        message: '채용 생성에 실패했습니다.',
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
