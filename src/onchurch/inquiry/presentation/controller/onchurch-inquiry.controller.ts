import { Body } from '@nestjs/common';
import { RestApiController, RestApiGet, RestApiPost } from '@/common/decorator/rest-api';
import { AuthSignature } from '@/common/decorator/AuthSignature';
import { UserSignature } from '@/common/type/type';
import { USER_TYPE } from '@/user/entity/user.entity';
import {
  OnchurchCreateMyInquiryUseCase,
  OnchurchListMyInquiriesUseCase,
} from '@/onchurch/inquiry/application/usecase/onchurch-inquiry.usecase';
import { OnchurchInquiryWriteRequest } from '@/onchurch/inquiry/presentation/dto/request/onchurch-inquiry-write.request';
import { OnchurchInquiryListResponse, OnchurchInquiryResponse } from '@/onchurch/inquiry/presentation/dto/response/onchurch-inquiry.response';

@RestApiController('/onchurch/inquiries', 'Onchurch Inquiry')
export class OnchurchInquiryController {
  constructor(
    private readonly createUseCase: OnchurchCreateMyInquiryUseCase,
    private readonly listUseCase: OnchurchListMyInquiriesUseCase,
  ) {}

  @RestApiGet(OnchurchInquiryListResponse, { path: '/me', description: '내 문의 목록 (질문+답변)', auth: [USER_TYPE.CLIENT] })
  async listMine(@AuthSignature() signature: UserSignature) {
    const items = await this.listUseCase.execute(signature.id);
    return new OnchurchInquiryListResponse(items);
  }

  @RestApiPost(OnchurchInquiryResponse, { path: '/me', description: '내 문의 등록', auth: [USER_TYPE.CLIENT] })
  async createMine(@AuthSignature() signature: UserSignature, @Body() request: OnchurchInquiryWriteRequest) {
    const item = await this.createUseCase.execute(signature.id, request.question.trim());
    return new OnchurchInquiryResponse(item);
  }
}
