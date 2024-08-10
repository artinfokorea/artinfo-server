import { HttpException, HttpStatus } from '@nestjs/common';

export class CommentNotFound extends HttpException {
  constructor() {
    super(
      {
        code: 'COMMENT-001',
        message: '댓글이 존재하지 않습니다.',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class CommentForbidden extends HttpException {
  constructor() {
    super(
      {
        code: 'COMMENT-002',
        message: '댓글에 대한 접근이 거부되었습니다.',
      },
      HttpStatus.FORBIDDEN,
    );
  }
}
