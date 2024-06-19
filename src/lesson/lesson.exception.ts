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
  constructor(message: string[]) {
    super(
      {
        code: 'LESSON-002',
        message: `프로필(${message})을 작성해 주세요.`,
      },
      HttpStatus.FORBIDDEN,
    );
  }
}

export class AlreadyLessonExists extends HttpException {
  constructor() {
    super(
      {
        code: 'LESSON-003',
        message: '유저의 레슨이 이미 존재합니다.',
      },
      HttpStatus.FORBIDDEN,
    );
  }
}
