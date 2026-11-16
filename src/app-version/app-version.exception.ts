import { HttpException, HttpStatus } from '@nestjs/common';

export class AppPlatformInvalid extends HttpException {
  constructor() {
    super({ code: 'APPVER-001', message: 'platform 은 ios 또는 android 여야 합니다.' }, HttpStatus.BAD_REQUEST);
  }
}

export class AppVersionInvalid extends HttpException {
  constructor() {
    super({ code: 'APPVER-002', message: '버전은 숫자와 점으로 1~4마디여야 합니다 (예: 1.2.0).' }, HttpStatus.BAD_REQUEST);
  }
}

export class AppVersionNotConfigured extends HttpException {
  constructor() {
    super({ code: 'APPVER-003', message: '앱 버전 설정이 없습니다.' }, HttpStatus.NOT_FOUND);
  }
}
