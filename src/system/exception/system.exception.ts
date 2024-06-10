import { HttpException, HttpStatus } from '@nestjs/common';

export class UploadImageIsNotValid extends HttpException {
  constructor() {
    super(
      {
        code: 'SYSTEM-001',
        message: '업로드 파일이 유효하지 않습니다.',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
