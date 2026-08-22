import { HttpException, HttpStatus } from '@nestjs/common';

export class OngiReportTargetNotFound extends HttpException {
  constructor() {
    super(
      {
        code: 'ONGI-REPORT-001',
        message: '신고 대상을 찾을 수 없어요.',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}
