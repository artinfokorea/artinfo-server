import { HttpException, HttpStatus } from '@nestjs/common';

export class AzeyoJokboTemplateNotFound extends HttpException {
  constructor() {
    super({ code: 'AZEYO-JOKBO-001', message: '족보가 존재하지 않습니다.' }, HttpStatus.NOT_FOUND);
  }
}

export class AzeyoJokboTemplateForbidden extends HttpException {
  constructor() {
    super({ code: 'AZEYO-JOKBO-002', message: '족보에 대한 권한이 없습니다.' }, HttpStatus.FORBIDDEN);
  }
}
