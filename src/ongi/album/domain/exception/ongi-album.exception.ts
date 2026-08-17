import { HttpException, HttpStatus } from '@nestjs/common';

export class OngiAlbumNotFound extends HttpException {
  constructor() {
    super(
      {
        code: 'ONGI-ALBUM-001',
        message: '앨범을 찾을 수 없어요.',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}
