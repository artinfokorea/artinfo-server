import { RestApiController, RestApiPost } from '@/common/decorator/rest-api';
import { CreateResponse } from '@/common/response/createResponse';
import { InquiryService } from '@/system/service/inquiry.service';
import { Body } from '@nestjs/common';
import { CreateInquiryRequest } from '@/system/dto/request/create-inquiry.request';

@RestApiController('/inquiries', 'Inquiry')
export class InquiryController {
  constructor(private readonly inquiryService: InquiryService) {}

  @RestApiPost(CreateResponse, { path: '/', description: '문의 생성' })
  createInquiry(@Body() request: CreateInquiryRequest) {
    return this.inquiryService.createInquiry(request.toCommand());
  }
}
