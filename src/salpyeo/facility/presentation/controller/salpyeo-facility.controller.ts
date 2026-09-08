import { Param, Query } from '@nestjs/common';
import { RestApiController, RestApiGet } from '@/common/decorator/rest-api';
import { SalpyeoScanFacilitiesUseCase } from '@/salpyeo/facility/application/usecase/salpyeo-scan-facilities.usecase';
import { SalpyeoGetFacilityUseCase } from '@/salpyeo/facility/application/usecase/salpyeo-get-facility.usecase';
import { SalpyeoScanFacilitiesRequest } from '@/salpyeo/facility/presentation/dto/request/salpyeo-scan-facilities.request';
import { SalpyeoFacilitiesResponse, SalpyeoFacilityResponse } from '@/salpyeo/facility/presentation/dto/response/salpyeo-facility.response';

@RestApiController('/salpyeo/facilities', 'Salpyeo Facility')
export class SalpyeoFacilityController {
  constructor(
    private readonly scanFacilitiesUseCase: SalpyeoScanFacilitiesUseCase,
    private readonly getFacilityUseCase: SalpyeoGetFacilityUseCase,
  ) {}

  @RestApiGet(SalpyeoFacilitiesResponse, { path: '', description: '시설 목록 (버티컬 필수, 검색어·slug·정렬 옵션)' })
  async scan(@Query() request: SalpyeoScanFacilitiesRequest) {
    return new SalpyeoFacilitiesResponse(await this.scanFacilitiesUseCase.execute(request.toQuery()));
  }

  @RestApiGet(SalpyeoFacilityResponse, { path: '/:slug', description: '시설 상세' })
  async get(@Param('slug') slug: string) {
    return new SalpyeoFacilityResponse(await this.getFacilityUseCase.execute(slug));
  }
}
