import { Body, Param, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { UploadFile } from '@/common/type/type';
import { RestApiController, RestApiGet, RestApiPost, RestApiPut } from '@/common/decorator/rest-api';
import { SalpyeoAdminGuard } from '@/salpyeo/common/salpyeo-admin.guard';
import {
  SalpyeoAdminGetFacilityUseCase,
  SalpyeoAdminScanFacilitiesUseCase,
  SalpyeoAdminUpdateFacilityUseCase,
} from '@/salpyeo/facility/application/usecase/salpyeo-admin-facility.usecase';
import { SalpyeoAdminUploadImageUseCase } from '@/salpyeo/facility/application/usecase/salpyeo-admin-upload-image.usecase';
import { SalpyeoAdminRehostImagesUseCase } from '@/salpyeo/facility/application/usecase/salpyeo-admin-rehost-images.usecase';
import { SalpyeoAdminRehostRequest } from '@/salpyeo/facility/presentation/dto/request/salpyeo-admin-rehost.request';
import { SalpyeoAdminImageResponse, SalpyeoAdminRehostResponse } from '@/salpyeo/facility/presentation/dto/response/salpyeo-admin-facility.response';
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
    private readonly uploadImageUseCase: SalpyeoAdminUploadImageUseCase,
    private readonly rehostImagesUseCase: SalpyeoAdminRehostImagesUseCase,
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

  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('imageFile', { limits: { fileSize: 10 * 1024 * 1024 } }))
  @RestApiPost(SalpyeoAdminImageResponse, { path: '/:slug/images', description: '관리자 시설 사진 업로드 (S3 공개 URL)' })
  async uploadImage(@Param('slug') slug: string, @UploadedFile() file: UploadFile) {
    // 업로드만 하고 시설에는 반영하지 않는다 — 관리자가 편집 폼에서 저장을 눌러야 반영된다
    const image = await this.uploadImageUseCase.execute(slug, file);

    return new SalpyeoAdminImageResponse(image);
  }

  @RestApiPost(SalpyeoAdminRehostResponse, {
    path: '/rehost-images',
    description: '조리원 홈페이지 사진을 우리 S3 로 이전 (한 번에 limit 곳, remaining 이 0 이 될 때까지 반복 호출)',
  })
  async rehostImages(@Body() request: SalpyeoAdminRehostRequest) {
    const result = await this.rehostImagesUseCase.execute(request.limit, request.slug?.trim() || undefined);

    return new SalpyeoAdminRehostResponse(result);
  }
}
