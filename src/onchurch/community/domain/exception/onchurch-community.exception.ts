import { HttpException, HttpStatus } from '@nestjs/common';

export class OnchurchCommunityPostNotFound extends HttpException {
  constructor() {
    super(
      {
        code: 'ONCHURCH-COMMUNITY-001',
        message: '게시글을 찾을 수 없습니다.',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class OnchurchCommunityChurchNotConfigured extends HttpException {
  constructor() {
    super(
      {
        code: 'ONCHURCH-COMMUNITY-002',
        message: '소속 교회 정보가 없습니다. 교회 페이지에서 가입한 계정으로 로그인해주세요.',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class OnchurchCommunityCategoryNotFound extends HttpException {
  constructor() {
    super(
      {
        code: 'ONCHURCH-COMMUNITY-003',
        message: '카테고리를 찾을 수 없습니다.',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class OnchurchCommunityForbidden extends HttpException {
  constructor() {
    super(
      {
        code: 'ONCHURCH-COMMUNITY-004',
        message: '본인이 작성한 게시글만 수정·삭제할 수 있습니다.',
      },
      HttpStatus.FORBIDDEN,
    );
  }
}
