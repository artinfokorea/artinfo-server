import { Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RestApiController, RestApiGet, RestApiPut } from '@/common/decorator/rest-api';
import { SalpyeoAdminGuard } from '@/salpyeo/common/salpyeo-admin.guard';
import {
  SalpyeoAdminGetFacilityUseCase,
  SalpyeoAdminScanFacilitiesUseCase,
  SalpyeoAdminUpdateFacilityUseCase,
} from '@/salpyeo/facility/application/usecase/salpyeo-admin-facility.usecase';
import { SalpyeoAdminScanFacilitiesRequest } from '@/salpyeo/facility/presentation/dto/request/salpyeo-admin-scan-facilities.request';
import { SalpyeoAdminUpdateFacilityRequest } from '@/salpyeo/facility/presentation/dto/request/salpyeo-admin-update-facility.request';
import { SalpyeoAdminFacilitiesResponse, SalpyeoAdminFacilityResponse } from '@/salpyeo/facility/presentation/dto/response/salpyeo-admin-facility.response';

/**
 * 관리자 전용 시설 편집 API.
 * 공개 목록/상세와 달리 노출을 내린(is_active=false) 시설도 보이고, 저장된 컬럼을 그대로 돌려준다.
 */
@ApiBearerAuth()
@UseGuards(SalpyeoAdminGuard)
@RestApiController('/salpyeo/admin/facilities', 'Salpyeo Admin')
export class SalpyeoAdminFacilityController {
  constructor(
    private readonly scanUseCase: SalpyeoAdminScanFacilitiesUseCase,
    private readonly getUseCase: SalpyeoAdminGetFacilityUseCase,
    private readonly updateUseCase: SalpyeoAdminUpdateFacilityUseCase,
  ) {}

  @RestApiGet(SalpyeoAdminFacilitiesResponse, { path: '/', description: '관리자 시설 목록 (노출 내린 시설 포함)' })
  async scan(@Query() request: SalpyeoAdminScanFacilitiesRequest) {
    const facilities = await this.scanUseCase.execute(request.vertical, request.q);

    return new SalpyeoAdminFacilitiesResponse(facilities);
  }

  @RestApiGet(SalpyeoAdminFacilityResponse, { path: '/:slug', description: '관리자 시설 상세 (편집 폼용)' })
  async get(@Param('slug') slug: string) {
    const facility = await this.getUseCase.execute(slug);

    return new SalpyeoAdminFacilityResponse(facility);
  }

  @RestApiPut(SalpyeoAdminFacilityResponse, { path: '/:slug', description: '관리자 시설 수정 (보낸 필드만 반영)' })
  async update(@Param('slug') slug: string, @Body() request: SalpyeoAdminUpdateFacilityRequest) {
    const facility = await this.updateUseCase.execute(slug, request);

    return new SalpyeoAdminFacilityResponse(facility);
  }
}
