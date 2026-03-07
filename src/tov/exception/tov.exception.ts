import { HttpException, HttpStatus } from '@nestjs/common';

export class TovUserNotFound extends HttpException {
  constructor() {
    super({ code: 'TOV-001', message: '유저를 찾을 수 없습니다.' }, HttpStatus.NOT_FOUND);
  }
}

export class TovExamInProgress extends HttpException {
  constructor() {
    super({ code: 'TOV-002', message: '이미 진행 중인 시험이 있습니다.' }, HttpStatus.CONFLICT);
  }
}

export class TovWordNotFoundInRange extends HttpException {
  constructor() {
    super({ code: 'TOV-003', message: '해당 범위에 단어가 없습니다.' }, HttpStatus.BAD_REQUEST);
  }
}

export class TovNoQuestionsGenerated extends HttpException {
  constructor() {
    super({ code: 'TOV-004', message: '문제를 생성할 수 없습니다.' }, HttpStatus.BAD_REQUEST);
  }
}

export class TovWordGroupNotFound extends HttpException {
  constructor() {
    super({ code: 'TOV-005', message: '단어 그룹을 찾을 수 없습니다.' }, HttpStatus.NOT_FOUND);
  }
}
