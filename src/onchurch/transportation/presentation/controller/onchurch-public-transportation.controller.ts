import { Param } from '@nestjs/common';
import { RestApiController, RestApiGet } from '@/common/decorator/rest-api';
import { OnchurchListPublicTransportationsUseCase } from '@/onchurch/transportation/application/usecase/onchurch-list-public-transportations.usecase';
import { OnchurchTransportationListResponse } from '@/onchurch/transportation/presentation/dto/response/onchurch-transportation.response';

@RestApiController('/onchurch/sites', 'Onchurch Public Site')
export class OnchurchPublicTransportationController {
  constructor(private readonly listPublicUseCase: OnchurchListPublicTransportationsUseCase) {}

  @RestApiGet(OnchurchTransportationListResponse, { path: '/:slug/transportations', description: '공개 - 특정 교회의 활성 교통편 목록' })
  async listPublic(@Param('slug') slug: string) {
    const items = await this.listPublicUseCase.execute(slug);
    return new OnchurchTransportationListResponse(items);
  }
}
