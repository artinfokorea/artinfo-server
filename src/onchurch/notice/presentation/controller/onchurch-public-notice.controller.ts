import { Param, Query } from '@nestjs/common';
import { RestApiController, RestApiGet } from '@/common/decorator/rest-api';
import { OnchurchListPublicNoticesUseCase } from '@/onchurch/notice/application/usecase/onchurch-list-public-notices.usecase';
import { OnchurchPublicNoticeListResponse } from '@/onchurch/notice/presentation/dto/response/onchurch-notice.response';

@RestApiController('/onchurch/sites', 'Onchurch Public Site')
export class OnchurchPublicNoticeController {
  constructor(private readonly listPublicUseCase: OnchurchListPublicNoticesUseCase) {}

  @RestApiGet(OnchurchPublicNoticeListResponse, { path: '/:slug/notices', description: '공개 - 특정 교회의 활성 공지 목록 (페이징)' })
  async listPublic(
    @Param('slug') slug: string,
    @Query('category') category?: string,
    @Query('keyword') keyword?: string,
    @Query('page') pageRaw?: string,
    @Query('size') sizeRaw?: string,
  ) {
    const page = Math.max(1, parseInt(pageRaw ?? '1', 10) || 1);
    const size = Math.max(1, Math.min(100, parseInt(sizeRaw ?? '20', 10) || 20));
    const { items, totalCount } = await this.listPublicUseCase.execute(slug, { category, keyword, page, size });
    return new OnchurchPublicNoticeListResponse(items, totalCount);
  }
}
