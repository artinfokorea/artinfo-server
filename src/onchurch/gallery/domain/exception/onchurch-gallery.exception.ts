import { HttpException, HttpStatus } from '@nestjs/common';

export class OnchurchGalleryChurchNotConfigured extends HttpException {
  constructor() {
    super(
      {
        code: 'ONCHURCH-GALLERY-001',
        message: '교회 정보를 먼저 등록해주세요.',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class OnchurchGalleryNotFound extends HttpException {
  constructor() {
    super(
      {
        code: 'ONCHURCH-GALLERY-002',
        message: '갤러리 항목을 찾을 수 없습니다.',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class OnchurchGalleryCategoryNotFound extends HttpException {
  constructor() {
    super(
      {
        code: 'ONCHURCH-GALLERY-003',
        message: '갤러리 카테고리를 찾을 수 없습니다.',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}
