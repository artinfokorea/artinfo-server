import { Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RestApiController, RestApiGet, RestApiPut } from '@/common/decorator/rest-api';
import { SalpyeoAdminGuard } from '@/salpyeo/common/salpyeo-admin.guard';
import { SalpyeoResolveInquiryUseCase, SalpyeoScanInquiriesUseCase } from '@/salpyeo/inquiry/application/usecase/salpyeo-inquiry.usecase';
import { SalpyeoResolveInquiryRequest } from '@/salpyeo/inquiry/presentation/dto/request/salpyeo-resolve-inquiry.request';
import { SalpyeoInquiriesResponse, SalpyeoInquiryResponse } from '@/salpyeo/inquiry/presentation/dto/response/salpyeo-inquiry.response';

/** 접수된 문의 확인 — 관리자 전용 */
@ApiBearerAuth()
@UseGuards(SalpyeoAdminGuard)
@RestApiController('/salpyeo/admin/inquiries', 'Salpyeo Admin')
export class SalpyeoAdminInquiryController {
  constructor(
    private readonly scanInquiriesUseCase: SalpyeoScanInquiriesUseCase,
    private readonly resolveInquiryUseCase: SalpyeoResolveInquiryUseCase,
  ) {}

  @RestApiGet(SalpyeoInquiriesResponse, { path: '/', description: '문의 목록 (최근 접수 순)' })
  async scan() {
    const inquiries = await this.scanInquiriesUseCase.execute();

    return new SalpyeoInquiriesResponse(inquiries);
  }

  @RestApiPut(SalpyeoInquiryResponse, { path: '/:id/resolved', description: '문의 처리 완료 표시' })
  async setResolved(@Param('id', ParseIntPipe) id: number, @Body() request: SalpyeoResolveInquiryRequest) {
    const inquiry = await this.resolveInquiryUseCase.execute(id, request.isResolved);

    return new SalpyeoInquiryResponse(inquiry);
  }
}
