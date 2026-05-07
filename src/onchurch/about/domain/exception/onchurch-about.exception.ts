import { HttpException, HttpStatus } from '@nestjs/common';

export class OnchurchAboutChurchNotConfigured extends HttpException {
  constructor() {
    super(
      {
        code: 'ONCHURCH-ABOUT-001',
        message: '교회 정보를 먼저 등록해주세요.',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class OnchurchVisionNotFound extends HttpException {
  constructor() {
    super(
      {
        code: 'ONCHURCH-ABOUT-002',
        message: '비전 항목을 찾을 수 없습니다.',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class OnchurchHistoryNotFound extends HttpException {
  constructor() {
    super(
      {
        code: 'ONCHURCH-ABOUT-003',
        message: '연혁 항목을 찾을 수 없습니다.',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class OnchurchStaffNotFound extends HttpException {
  constructor() {
    super(
      {
        code: 'ONCHURCH-ABOUT-004',
        message: '교역자 정보를 찾을 수 없습니다.',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}
