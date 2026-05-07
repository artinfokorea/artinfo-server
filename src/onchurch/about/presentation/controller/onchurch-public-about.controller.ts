import { Param } from '@nestjs/common';
import { RestApiController, RestApiGet } from '@/common/decorator/rest-api';
import { OnchurchListPublicAboutUseCase } from '@/onchurch/about/application/usecase/onchurch-list-public-about.usecase';
import { OnchurchPublicAboutResponse } from '@/onchurch/about/presentation/dto/response/onchurch-about.response';

@RestApiController('/onchurch/sites', 'Onchurch Public Site')
export class OnchurchPublicAboutController {
  constructor(private readonly listPublicUseCase: OnchurchListPublicAboutUseCase) {}

  @RestApiGet(OnchurchPublicAboutResponse, { path: '/:slug/about', description: '공개 - 교회 소개 (담임목사 + 비전 + 연혁 + 교역자)' })
  async listPublic(@Param('slug') slug: string) {
    const view = await this.listPublicUseCase.execute(slug);
    return new OnchurchPublicAboutResponse(view);
  }
}
