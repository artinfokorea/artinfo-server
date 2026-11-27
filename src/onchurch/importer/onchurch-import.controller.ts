import { Body, Param, ParseIntPipe } from '@nestjs/common';
import { RestApiController, RestApiPost } from '@/common/decorator/rest-api';
import { AuthSignature } from '@/common/decorator/AuthSignature';
import { UserSignature } from '@/common/type/type';
import { USER_TYPE } from '@/user/entity/user.entity';
import { OnchurchWordpressImportUseCase } from '@/onchurch/importer/onchurch-wordpress-import.usecase';
import { OnchurchBrokenSermonUseCase } from '@/onchurch/importer/onchurch-broken-sermon.usecase';
import {
  OnchurchBrokenSermonFindRequest,
  OnchurchBrokenSermonFindResponse,
  OnchurchSermonDeleteRequest,
  OnchurchSermonDeleteResponse,
  OnchurchWordpressCategoriesResponse,
  OnchurchWordpressImportRequest,
  OnchurchWordpressImportResponse,
  OnchurchWordpressSourceRequest,
} from '@/onchurch/importer/onchurch-import.dto';

// 마스터 전용: 다른(워드프레스) 교회 사이트의 글을 온교회 교회로 옮긴다.
@RestApiController('/onchurch/master/import', 'Onchurch Master Import')
export class OnchurchImportController {
  constructor(
    private readonly wordpressImport: OnchurchWordpressImportUseCase,
    private readonly brokenSermons: OnchurchBrokenSermonUseCase,
  ) {}

  @RestApiPost(OnchurchWordpressCategoriesResponse, { path: '/wordpress/categories', description: '워드프레스 사이트 카테고리 목록', auth: [USER_TYPE.CLIENT] })
  async categories(@AuthSignature() signature: UserSignature, @Body() request: OnchurchWordpressSourceRequest) {
    return new OnchurchWordpressCategoriesResponse(await this.wordpressImport.listCategories(signature.id, request.sourceUrl));
  }

  @RestApiPost(OnchurchWordpressImportResponse, {
    path: '/churches/:id/wordpress',
    description: '워드프레스 글 한 쪽을 교회로 옮기기',
    auth: [USER_TYPE.CLIENT],
  })
  async importPage(@AuthSignature() signature: UserSignature, @Param('id', ParseIntPipe) id: number, @Body() request: OnchurchWordpressImportRequest) {
    return new OnchurchWordpressImportResponse(await this.wordpressImport.importPage(signature.id, id, request.toRequest()));
  }

  @RestApiPost(OnchurchBrokenSermonFindResponse, {
    path: '/churches/:id/sermons/broken',
    description: '영상이 안 나오는 설교 찾기(한 번에 limit 개)',
    auth: [USER_TYPE.CLIENT],
  })
  async findBrokenSermons(@AuthSignature() signature: UserSignature, @Param('id', ParseIntPipe) id: number, @Body() request: OnchurchBrokenSermonFindRequest) {
    return new OnchurchBrokenSermonFindResponse(await this.brokenSermons.find(signature.id, id, request.offset, request.limit));
  }

  @RestApiPost(OnchurchSermonDeleteResponse, { path: '/churches/:id/sermons/delete', description: '교회 설교 삭제(마스터)', auth: [USER_TYPE.CLIENT] })
  async deleteSermons(@AuthSignature() signature: UserSignature, @Param('id', ParseIntPipe) id: number, @Body() request: OnchurchSermonDeleteRequest) {
    return new OnchurchSermonDeleteResponse((await this.brokenSermons.remove(signature.id, id, request.ids)).deleted);
  }
}
