import { Param } from '@nestjs/common';
import { RestApiController, RestApiGet } from '@/common/decorator/rest-api';
import { OnchurchListPublicWorshipUseCase } from '@/onchurch/worship/application/usecase/onchurch-list-public-worship.usecase';
import { OnchurchPublicWorshipResponse } from '@/onchurch/worship/presentation/dto/response/onchurch-worship.response';

@RestApiController('/onchurch/sites', 'Onchurch Public Site')
export class OnchurchPublicWorshipController {
  constructor(private readonly listPublicUseCase: OnchurchListPublicWorshipUseCase) {}

  @RestApiGet(OnchurchPublicWorshipResponse, { path: '/:slug/worship', description: '공개 - 교회 예배 안내 (시간표 + 예배 순서)' })
  async listPublic(@Param('slug') slug: string) {
    const view = await this.listPublicUseCase.execute(slug);
    return new OnchurchPublicWorshipResponse(view);
  }
}
