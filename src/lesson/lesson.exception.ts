import { HttpException, HttpStatus } from '@nestjs/common';

export class LessonNotFound extends HttpException {
  constructor() {
    super(
      {
        code: 'LESSON-001',
        message: '레슨이 존재하지 않습니다.',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class UserDoesNotQualify extends HttpException {
  constructor() {
    super(
      {
        code: 'LESSON-002',
        message: '레슨 조건을 만족하지 못합니다.',
      },
      HttpStatus.FORBIDDEN,
    );
  }
}
