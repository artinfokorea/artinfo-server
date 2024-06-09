import { RestApiController, RestApiGet } from '@/common/decorator/rest-api';
import { province } from '@/system/entity/province';
import { ProvinceAllResponse } from '@/system/dto/response/province-all.response';

@RestApiController('/system', 'System')
export class SystemController {
  constructor() {}

  @RestApiGet(ProvinceAllResponse, { path: '/province', description: '행정 구역 조회' })
  async getProvince() {
    return new ProvinceAllResponse(province);
  }
}
