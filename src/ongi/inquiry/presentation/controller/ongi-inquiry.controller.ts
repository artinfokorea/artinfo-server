import { Body } from '@nestjs/common';
import { RestApiController, RestApiGet, RestApiPost } from '@/common/decorator/rest-api';
import { AuthSignature } from '@/common/decorator/AuthSignature';
import { UserSignature } from '@/common/type/type';
import { USER_TYPE } from '@/user/entity/user.entity';
import { OngiCreateInquiryUseCase, OngiScanMyInquiriesUseCase } from '@/ongi/inquiry/application/usecase/ongi-inquiry.usecase';
import { OngiCreateInquiryRequest } from '@/ongi/inquiry/presentation/dto/request/ongi-create-inquiry.request';
import { OngiInquiryListResponse, OngiInquiryResponse } from '@/ongi/inquiry/presentation/dto/response/ongi-inquiry.response';

@RestApiController('/ongi/inquiries', 'Ongi Inquiry')
export class OngiInquiryController {
  constructor(
    private readonly createInquiryUseCase: OngiCreateInquiryUseCase,
    private readonly scanMyInquiriesUseCase: OngiScanMyInquiriesUseCase,
  ) {}

  @RestApiPost(OngiInquiryResponse, { path: '/', description: '문의 남기기 — 운영자가 관리자 페이지에서 답변', auth: [USER_TYPE.CLIENT] })
  async create(@AuthSignature() signature: UserSignature, @Body() request: OngiCreateInquiryRequest) {
    return new OngiInquiryResponse(await this.createInquiryUseCase.execute(signature.id, request.content));
  }

  @RestApiGet(OngiInquiryListResponse, { path: '/', description: '내 문의와 답변 (최근 순)', auth: [USER_TYPE.CLIENT] })
  async scanMine(@AuthSignature() signature: UserSignature) {
    return new OngiInquiryListResponse(await this.scanMyInquiriesUseCase.execute(signature.id));
  }
}
