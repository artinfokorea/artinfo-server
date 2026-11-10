import { HttpException, HttpStatus } from '@nestjs/common';

export class CompetitionNotFound extends HttpException {
  constructor() {
    super({ code: 'COMPETITION-001', message: '콩쿠르 공고를 찾을 수 없습니다.' }, HttpStatus.NOT_FOUND);
  }
}

export class CompetitionNotAllowed extends HttpException {
  constructor() {
    super({ code: 'COMPETITION-002', message: '이 공고를 수정하거나 삭제할 권한이 없습니다.' }, HttpStatus.FORBIDDEN);
  }
}

export class CompetitionNotPublished extends HttpException {
  constructor() {
    super({ code: 'COMPETITION-003', message: '아직 게시되지 않은 공고입니다.' }, HttpStatus.NOT_FOUND);
  }
}
