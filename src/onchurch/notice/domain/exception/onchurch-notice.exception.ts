import { HttpException, HttpStatus } from '@nestjs/common';

export class OnchurchNoticeNotFound extends HttpException {
  constructor() {
    super(
      {
        code: 'ONCHURCH-NOTICE-001',
        message: '공지사항을 찾을 수 없습니다.',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class OnchurchNoticeChurchNotConfigured extends HttpException {
  constructor() {
    super(
      {
        code: 'ONCHURCH-NOTICE-002',
        message: '교회 정보를 먼저 등록해주세요.',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class OnchurchNoticeCategoryNotFound extends HttpException {
  constructor() {
    super(
      {
        code: 'ONCHURCH-NOTICE-003',
        message: '카테고리를 찾을 수 없습니다.',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}
