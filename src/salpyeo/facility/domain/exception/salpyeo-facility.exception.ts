import { HttpException, HttpStatus } from '@nestjs/common';

export class SalpyeoVerticalNotFound extends HttpException {
  constructor() {
    super({ code: 'SALPYEO-VERTICAL-001', message: '알 수 없는 시설 종류예요.' }, HttpStatus.NOT_FOUND);
  }
}

export class SalpyeoVerticalNotReady extends HttpException {
  constructor() {
    super({ code: 'SALPYEO-VERTICAL-002', message: '아직 준비 중인 시설 종류예요.' }, HttpStatus.FORBIDDEN);
  }
}

export class SalpyeoFacilityNotFound extends HttpException {
  constructor() {
    super({ code: 'SALPYEO-FACILITY-001', message: '시설을 찾을 수 없어요.' }, HttpStatus.NOT_FOUND);
  }
}
