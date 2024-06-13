import { RestApiController, RestApiGet } from '@/common/decorator/rest-api';
import { ProvinceService } from '@/province/province.service';
import { ProvincesResponse } from '@/province/dto/response/provinces.response';
import { Query } from '@nestjs/common';
import { GetProvincesRequest } from '@/province/dto/request/get-provinces.request';

@RestApiController('/provinces', 'Province')
export class ProvinceController {
  constructor(private readonly provinceService: ProvinceService) {}

  @RestApiGet(ProvincesResponse, { path: '/', description: '행정 구역 목록 조회' })
  async getProvinces(@Query() request: GetProvincesRequest) {
    const provinces = await this.provinceService.getProvinces(request.parentId);

    return new ProvincesResponse(provinces);
  }
  //
  // @RestApiPost(OkResponse, { path: '/', description: '행정 구역 생성' })
  // async createProvinces() {
  //   await this.provinceService.insertProvinces();
  //   return new OkResponse();
  // }
}
