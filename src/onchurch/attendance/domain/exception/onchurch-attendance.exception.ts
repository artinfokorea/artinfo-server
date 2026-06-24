import { HttpException, HttpStatus } from '@nestjs/common';

export class OnchurchAttendanceChurchNotConfigured extends HttpException {
  constructor() {
    super(
      {
        code: 'ONCHURCH-ATTENDANCE-001',
        message: '교회 정보를 먼저 등록해주세요.',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
