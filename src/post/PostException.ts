import { HttpException, HttpStatus } from '@nestjs/common';

export class PostNotFound extends HttpException {
  constructor() {
    super(
      {
        code: 'Post-001',
        message: '게시글이 존재하지 않습니다.',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}
