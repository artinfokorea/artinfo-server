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

export class PartTimeJobScheduleRequired extends HttpException {
  constructor() {
    super(
      {
        code: 'JOB-004',
        message: '오브리 생성시 일정이 하나이상 필요합니다',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class PartTimeJobUserPhoneRequired extends HttpException {
  constructor() {
    super(
      {
        code: 'JOB-005',
        message: '오브리 생성시 유저 연락처 정보가 필요합니다',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
