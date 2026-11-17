import { Param } from '@nestjs/common';
import { RestApiController, RestApiGet } from '@/common/decorator/rest-api';
import { Signature } from '@/common/decorator/Signature';
import { UserSignature } from '@/common/type/type';
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

  @RestApiGet(OnchurchCustomPageResponse, {
    path: '/:slug/custom-pages/:pageSlug',
    description: '공개 - 커스텀 페이지 본문. 회원공개 페이지는 교인 토큰이 있을 때만 본문이 내려가고, 없으면 locked=true 에 blocks=[]',
  })
  async getPublic(@Param('slug') slug: string, @Param('pageSlug') pageSlug: string, @Signature() signature: UserSignature | null) {
    const view = await this.getUseCase.execute(slug, pageSlug, signature?.id ?? null);
    return new OnchurchCustomPageResponse(view.page, { locked: view.locked });
  }
}
