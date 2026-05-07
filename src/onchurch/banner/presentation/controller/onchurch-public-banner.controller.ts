import { Param } from '@nestjs/common';
import { RestApiController, RestApiGet } from '@/common/decorator/rest-api';
import { OnchurchListPublicBannersUseCase } from '@/onchurch/banner/application/usecase/onchurch-list-public-banners.usecase';
import { OnchurchPublicBannerListResponse } from '@/onchurch/banner/presentation/dto/response/onchurch-banner.response';

@RestApiController('/onchurch/sites', 'Onchurch Public Site')
export class OnchurchPublicBannerController {
  constructor(private readonly listPublicUseCase: OnchurchListPublicBannersUseCase) {}

  @RestApiGet(OnchurchPublicBannerListResponse, { path: '/:slug/banners', description: '공개 - 특정 교회의 활성 배너 목록 (없으면 default 1개 반환)' })
  async listPublic(@Param('slug') slug: string) {
    const views = await this.listPublicUseCase.execute(slug);
    return new OnchurchPublicBannerListResponse(views);
  }
}
