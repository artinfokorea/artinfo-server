import { HttpException, HttpStatus } from '@nestjs/common';

export class OnchurchSermonChurchNotConfigured extends HttpException {
  constructor() {
    super(
      {
        code: 'ONCHURCH-SERMON-001',
        message: '교회 정보를 먼저 등록해주세요.',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class OnchurchSermonNotFound extends HttpException {
  constructor() {
    super(
      {
        code: 'ONCHURCH-SERMON-002',
        message: '설교를 찾을 수 없습니다.',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class OnchurchSermonSeriesNotFound extends HttpException {
  constructor() {
    super(
      {
        code: 'ONCHURCH-SERMON-003',
        message: '시리즈를 찾을 수 없습니다.',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}
