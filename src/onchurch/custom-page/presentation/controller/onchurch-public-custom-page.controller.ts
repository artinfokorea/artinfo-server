import { Param } from '@nestjs/common';
import { RestApiController, RestApiGet } from '@/common/decorator/rest-api';
import {
  OnchurchListPublicCustomPagesUseCase,
  OnchurchGetPublicCustomPageUseCase,
} from '@/onchurch/custom-page/application/usecase/onchurch-custom-page.usecase';
import { OnchurchCustomPageListResponse, OnchurchCustomPageResponse } from '@/onchurch/custom-page/presentation/dto/response/onchurch-custom-page.response';

@RestApiController('/onchurch/sites', 'Onchurch Public Site')
export class OnchurchPublicCustomPageController {
  constructor(
    private readonly listUseCase: OnchurchListPublicCustomPagesUseCase,
    private readonly getUseCase: OnchurchGetPublicCustomPageUseCase,
  ) {}

  @RestApiGet(OnchurchCustomPageListResponse, { path: '/:slug/custom-pages', description: '공개 - 특정 교회의 활성 커스텀 페이지 목록 (네비 구성용)' })
  async listPublic(@Param('slug') slug: string) {
    return new OnchurchCustomPageListResponse(await this.listUseCase.execute(slug));
  }

  @RestApiGet(OnchurchCustomPageResponse, { path: '/:slug/custom-pages/:pageSlug', description: '공개 - 커스텀 페이지 본문' })
  async getPublic(@Param('slug') slug: string, @Param('pageSlug') pageSlug: string) {
    return new OnchurchCustomPageResponse(await this.getUseCase.execute(slug, pageSlug));
  }
}
