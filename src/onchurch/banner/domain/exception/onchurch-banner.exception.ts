import { HttpException, HttpStatus } from '@nestjs/common';

export class OnchurchBannerNotFound extends HttpException {
  constructor() {
    super(
      {
        code: 'ONCHURCH-BANNER-001',
        message: '배너를 찾을 수 없습니다.',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class OnchurchChurchNotConfigured extends HttpException {
  constructor() {
    super(
      {
        code: 'ONCHURCH-BANNER-002',
        message: '교회 정보를 먼저 등록해주세요.',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
