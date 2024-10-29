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

export class OwnJobApplicationNotAllowed extends HttpException {
  constructor() {
    super(
      {
        code: 'Job-006',
        message: '본인 소유의 채용에는 신청할 수 없습니다.',
      },
      HttpStatus.FORBIDDEN,
    );
  }
}

export class AlreadyAppliedJob extends HttpException {
  constructor() {
    super(
      {
        code: 'Job-007',
        message: '이미 지원 완료된 연주입니다.',
      },
      HttpStatus.CONFLICT,
    );
  }
}

export class JobApplicantsNotAllowed extends HttpException {
  constructor() {
    super(
      {
        code: 'Job-008',
        message: '연주 신청자를 조회할 수 없습니다.',
      },
      HttpStatus.FORBIDDEN,
    );
  }
}

export class UnableApplyJob extends HttpException {
  constructor() {
    super(
      {
        code: 'Job-009',
        message: '해당 채용은 연주 신청을 할 수 없습니다.',
      },
      HttpStatus.FORBIDDEN,
    );
  }
}
