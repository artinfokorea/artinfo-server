import { Body, Param, ParseIntPipe } from '@nestjs/common';
import { RestApiController, RestApiPost, RestApiPut } from '@/common/decorator/rest-api';
import { AuthSignature } from '@/common/decorator/AuthSignature';
import { UserSignature } from '@/common/type/type';
import { USER_TYPE } from '@/user/entity/user.entity';
import { OnchurchSalesLeadUseCase } from '@/onchurch/sales/onchurch-sales-lead.usecase';
import {
  OnchurchSalesLeadDeleteRequest,
  OnchurchSalesLeadDeleteResponse,
  OnchurchSalesLeadDto,
  OnchurchSalesLeadImportRequest,
  OnchurchSalesLeadImportResponse,
  OnchurchSalesLeadInputDto,
  OnchurchSalesLeadSearchRequest,
  OnchurchSalesLeadSearchResponse,
} from '@/onchurch/sales/onchurch-sales-lead.dto';

// 마스터 전용: 영업 대상 교회 DB
@RestApiController('/onchurch/master/sales-leads', 'Onchurch Master Sales Leads')
export class OnchurchSalesLeadController {
  constructor(private readonly useCase: OnchurchSalesLeadUseCase) {}

  @RestApiPost(OnchurchSalesLeadSearchResponse, { path: '/search', description: '영업 대상 검색', auth: [USER_TYPE.CLIENT] })
  async search(@AuthSignature() signature: UserSignature, @Body() request: OnchurchSalesLeadSearchRequest) {
    return new OnchurchSalesLeadSearchResponse(await this.useCase.search(signature.id, request));
  }

  @RestApiPost(OnchurchSalesLeadImportResponse, { path: '/import', description: '영업 대상 여러 건 가져오기(겹치는 교회는 건너뜀)', auth: [USER_TYPE.CLIENT] })
  async import(@AuthSignature() signature: UserSignature, @Body() request: OnchurchSalesLeadImportRequest) {
    return new OnchurchSalesLeadImportResponse(await this.useCase.importRows(signature.id, request.rows));
  }

  @RestApiPost(OnchurchSalesLeadDeleteResponse, { path: '/delete', description: '영업 대상 삭제', auth: [USER_TYPE.CLIENT] })
  async remove(@AuthSignature() signature: UserSignature, @Body() request: OnchurchSalesLeadDeleteRequest) {
    return new OnchurchSalesLeadDeleteResponse((await this.useCase.remove(signature.id, request.ids)).deleted);
  }

  @RestApiPost(OnchurchSalesLeadDto, { path: '', description: '영업 대상 한 건 추가', auth: [USER_TYPE.CLIENT] })
  async create(@AuthSignature() signature: UserSignature, @Body() request: OnchurchSalesLeadInputDto) {
    return new OnchurchSalesLeadDto(await this.useCase.create(signature.id, request));
  }

  @RestApiPut(OnchurchSalesLeadDto, { path: '/:id', description: '영업 대상 수정', auth: [USER_TYPE.CLIENT] })
  async update(@AuthSignature() signature: UserSignature, @Param('id', ParseIntPipe) id: number, @Body() request: OnchurchSalesLeadInputDto) {
    return new OnchurchSalesLeadDto(await this.useCase.update(signature.id, id, request));
  }
}
