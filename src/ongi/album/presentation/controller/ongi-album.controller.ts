import { Body, Param, ParseIntPipe } from '@nestjs/common';
import { RestApiController, RestApiGet, RestApiPost } from '@/common/decorator/rest-api';
import { AuthSignature } from '@/common/decorator/AuthSignature';
import { UserSignature } from '@/common/type/type';
import { USER_TYPE } from '@/user/entity/user.entity';
import { OngiCreateAlbumUseCase, OngiScanAlbumsUseCase } from '@/ongi/album/application/usecase/ongi-album.usecase';
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
