import { HttpException, HttpStatus } from '@nestjs/common';

export class AzeyoCommunityPostNotFound extends HttpException {
  constructor() {
    super({ code: 'AZEYO-COMMUNITY-001', message: '게시글이 존재하지 않습니다.' }, HttpStatus.NOT_FOUND);
  }
}

export class AzeyoCommunityPostForbidden extends HttpException {
  constructor() {
    super({ code: 'AZEYO-COMMUNITY-002', message: '게시글에 대한 권한이 없습니다.' }, HttpStatus.FORBIDDEN);
  }
}

export class AzeyoCommunityNotVotePost extends HttpException {
  constructor() {
    super({ code: 'AZEYO-COMMUNITY-003', message: '투표 게시글이 아닙니다.' }, HttpStatus.BAD_REQUEST);
  }
}

export class AzeyoCommunityCommentNotFound extends HttpException {
  constructor() {
    super({ code: 'AZEYO-COMMUNITY-004', message: '댓글이 존재하지 않습니다.' }, HttpStatus.NOT_FOUND);
  }
}
