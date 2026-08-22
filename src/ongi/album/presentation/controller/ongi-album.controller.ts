import { Body, Param, ParseIntPipe } from '@nestjs/common';
import { RestApiController, RestApiDelete, RestApiGet, RestApiPost, RestApiPut } from '@/common/decorator/rest-api';
import { AuthSignature } from '@/common/decorator/AuthSignature';
import { UserSignature } from '@/common/type/type';
import { USER_TYPE } from '@/user/entity/user.entity';
import { OkResponse } from '@/common/response/ok.response';
import {
  OngiCreateAlbumUseCase,
  OngiDeleteAlbumUseCase,
  OngiRenameAlbumUseCase,
  OngiScanAlbumsUseCase,
} from '@/ongi/album/application/usecase/ongi-album.usecase';
import { OngiCreateAlbumRequest } from '@/ongi/album/presentation/dto/request/ongi-create-album.request';
import { OngiAlbumListResponse, OngiAlbumResponse } from '@/ongi/album/presentation/dto/response/ongi-album.response';

@RestApiController('/ongi/groups', 'Ongi Album')
export class OngiAlbumController {
  constructor(
    private readonly scanAlbumsUseCase: OngiScanAlbumsUseCase,
    private readonly createAlbumUseCase: OngiCreateAlbumUseCase,
  ) {}

  @RestApiGet(OngiAlbumListResponse, { path: '/:groupId/albums', description: '그룹의 앨범 목록', auth: [USER_TYPE.CLIENT] })
  async scanAlbums(@AuthSignature() signature: UserSignature, @Param('groupId', ParseIntPipe) groupId: number) {
    const views = await this.scanAlbumsUseCase.execute(signature.id, groupId);

    return new OngiAlbumListResponse(views);
  }

  @RestApiPost(OngiAlbumResponse, { path: '/:groupId/albums', description: '앨범 만들기', auth: [USER_TYPE.CLIENT] })
  async createAlbum(@AuthSignature() signature: UserSignature, @Param('groupId', ParseIntPipe) groupId: number, @Body() request: OngiCreateAlbumRequest) {
    const view = await this.createAlbumUseCase.execute(signature.id, groupId, request.title.trim());

    return new OngiAlbumResponse(view);
  }
}

/** 앨범 단건 조작 — 경로가 그룹이 아니라 앨범 기준이라 컨트롤러를 분리 */
@RestApiController('/ongi/albums', 'Ongi Album')
export class OngiAlbumItemController {
  constructor(
    private readonly renameAlbumUseCase: OngiRenameAlbumUseCase,
    private readonly deleteAlbumUseCase: OngiDeleteAlbumUseCase,
  ) {}

  @RestApiPut(OngiAlbumResponse, { path: '/:albumId', description: '앨범 이름 변경', auth: [USER_TYPE.CLIENT] })
  async renameAlbum(@AuthSignature() signature: UserSignature, @Param('albumId', ParseIntPipe) albumId: number, @Body() request: OngiCreateAlbumRequest) {
    const view = await this.renameAlbumUseCase.execute(signature.id, albumId, request.title.trim());

    return new OngiAlbumResponse(view);
  }

  @RestApiDelete(OkResponse, { path: '/:albumId', description: '앨범 삭제 — 담긴 사진은 미분류로 이동', auth: [USER_TYPE.CLIENT] })
  async deleteAlbum(@AuthSignature() signature: UserSignature, @Param('albumId', ParseIntPipe) albumId: number) {
    await this.deleteAlbumUseCase.execute(signature.id, albumId);

    return new OkResponse();
  }
}
