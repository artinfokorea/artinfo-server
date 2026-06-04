import { Param, ParseIntPipe, Query } from '@nestjs/common';
import { RestApiController, RestApiGet, RestApiPost } from '@/common/decorator/rest-api';
import { OkResponse } from '@/common/response/ok.response';
import { OnchurchListPublicCommunityPostsUseCase } from '@/onchurch/community/application/usecase/onchurch-list-public-community-posts.usecase';
import { OnchurchGetPublicCommunityPostUseCase } from '@/onchurch/community/application/usecase/onchurch-get-public-community-post.usecase';
import { OnchurchReportPublicCommunityPostUseCase } from '@/onchurch/community/application/usecase/onchurch-report-public-community-post.usecase';
import { OnchurchListPublicCommunityCategoriesUseCase } from '@/onchurch/community/application/usecase/onchurch-community-category.usecase';
import {
  OnchurchCommunityPostResponse,
  OnchurchPublicCommunityPostListResponse,
  OnchurchCommunityCategoryListResponse,
} from '@/onchurch/community/presentation/dto/response/onchurch-community.response';

@RestApiController('/onchurch/sites', 'Onchurch Public Site')
export class OnchurchPublicCommunityController {
  constructor(
    private readonly listPublicUseCase: OnchurchListPublicCommunityPostsUseCase,
    private readonly getPublicUseCase: OnchurchGetPublicCommunityPostUseCase,
    private readonly reportUseCase: OnchurchReportPublicCommunityPostUseCase,
    private readonly listCategoriesUseCase: OnchurchListPublicCommunityCategoriesUseCase,
  ) {}

  @RestApiGet(OnchurchPublicCommunityPostListResponse, { path: '/:slug/community-posts', description: '공개 - 교제 게시글 목록 (페이징)' })
  async listPublic(
    @Param('slug') slug: string,
    @Query('category') category?: string,
    @Query('page') pageRaw?: string,
    @Query('size') sizeRaw?: string,
  ) {
    const page = Math.max(1, parseInt(pageRaw ?? '1', 10) || 1);
    const size = Math.max(1, Math.min(100, parseInt(sizeRaw ?? '20', 10) || 20));
    const { items, totalCount } = await this.listPublicUseCase.execute(slug, { category, page, size });
    return new OnchurchPublicCommunityPostListResponse(items, totalCount);
  }

  @RestApiGet(OnchurchCommunityCategoryListResponse, { path: '/:slug/community-categories', description: '공개 - 교제 게시판 활성 카테고리 목록' })
  async listCategories(@Param('slug') slug: string) {
    return new OnchurchCommunityCategoryListResponse(await this.listCategoriesUseCase.execute(slug));
  }

  @RestApiGet(OnchurchCommunityPostResponse, { path: '/:slug/community-posts/:id', description: '공개 - 교제 게시글 상세' })
  async getPublic(@Param('slug') slug: string, @Param('id', ParseIntPipe) id: number) {
    return new OnchurchCommunityPostResponse(await this.getPublicUseCase.execute(slug, id));
  }

  @RestApiPost(OkResponse, { path: '/:slug/community-posts/:id/report', description: '공개 - 교제 게시글 신고' })
  async report(@Param('slug') slug: string, @Param('id', ParseIntPipe) id: number) {
    await this.reportUseCase.execute(slug, id);
    return new OkResponse();
  }
}
