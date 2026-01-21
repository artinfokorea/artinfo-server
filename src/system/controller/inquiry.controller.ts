import { RestApiController, RestApiPost } from '@/common/decorator/rest-api';
import { CreateResponse } from '@/common/response/createResponse';
import { InquiryService } from '@/system/service/inquiry.service';
import { Body } from '@nestjs/common';
import { CreateInquiryRequest } from '@/system/dto/request/create-inquiry.request';
import { CreatePerformanceInquiryRequest } from '@/system/dto/request/create-performace-inquiry.request';
import { ProvinceRepository } from '@/province/province.repository';

@RestApiController('/inquiries', 'Inquiry')
export class InquiryController {
  constructor(
    private readonly inquiryService: InquiryService,
    private readonly provinceRepository: ProvinceRepository,
  ) {}

  @RestApiPost(CreateResponse, { path: '/', description: '문의 생성' })
  createInquiry(@Body() request: CreateInquiryRequest) {
    return this.inquiryService.createInquiry(request.toCommand());
  }

  @RestApiPost(CreateResponse, { path: '/performance', description: '기획 문의 생성' })
  async createPerformanceInquiry(@Body() request: CreatePerformanceInquiryRequest) {
    const provinces = await this.provinceRepository.findByIds(request.provinceIds);
    const provinceNames = provinces.map(province => province.name);
    return this.inquiryService.createInquiry(request.toCommand(provinceNames));
  }
}
