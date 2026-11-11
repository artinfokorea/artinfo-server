import { RestApiController, RestApiPost } from '@/common/decorator/rest-api';
import { CreateResponse } from '@/common/response/createResponse';
import { InquiryService } from '@/system/service/inquiry.service';
import { Body, Ip } from '@nestjs/common';
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
  async createInquiry(@Body() request: CreateInquiryRequest, @Ip() ip: string) {
    return new CreateResponse(await this.inquiryService.createInquiry(request.toCommand(), { ip, website: request.website, startedAt: request.startedAt }));
  }

  @RestApiPost(CreateResponse, { path: '/performance', description: '기획 문의 생성' })
  async createPerformanceInquiry(@Body() request: CreatePerformanceInquiryRequest) {
    const provinces = await this.provinceRepository.findByIds(request.provinceIds);
    const provinceNames = provinces.map(province => province.name);
    return this.inquiryService.createInquiry(request.toCommand(provinceNames));
  }
}
