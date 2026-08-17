import { HttpException, HttpStatus } from '@nestjs/common';

export class OngiPhotoNotFound extends HttpException {
  constructor() {
    super(
      {
        code: 'ONGI-PHOTO-001',
        message: '사진을 찾을 수 없어요.',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class OngiUploadTargetRequired extends HttpException {
  constructor() {
    super(
      {
        code: 'ONGI-PHOTO-002',
        message: '게시할 가족 공간을 선택해 주세요.',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class OngiUploadPhotoRequired extends HttpException {
  constructor() {
    super(
      {
        code: 'ONGI-PHOTO-003',
        message: '올릴 사진을 선택해 주세요.',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class OngiAlbumNotInGroup extends HttpException {
  constructor() {
    super(
      {
        code: 'ONGI-PHOTO-004',
        message: '선택한 앨범이 해당 가족 공간에 없어요.',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
