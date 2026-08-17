import { Body, Param, ParseIntPipe } from '@nestjs/common';
import { RestApiController, RestApiGet, RestApiPost } from '@/common/decorator/rest-api';
import { AuthSignature } from '@/common/decorator/AuthSignature';
import { UserSignature } from '@/common/type/type';
import { USER_TYPE } from '@/user/entity/user.entity';
import {
  OngiAddCommentUseCase,
  OngiGetPhotoUseCase,
  OngiScanAlbumPhotosUseCase,
  OngiScanCommentsUseCase,
  OngiScanFeedUseCase,
  OngiScanPersonPhotosUseCase,
  OngiToggleLikeUseCase,
  OngiUploadPhotosUseCase,
} from '@/ongi/photo/application/usecase/ongi-photo.usecase';
import { OngiUploadPhotosRequest } from '@/ongi/photo/presentation/dto/request/ongi-upload-photos.request';
import { OngiAddCommentRequest } from '@/ongi/photo/presentation/dto/request/ongi-add-comment.request';
import {
  OngiCommentListResponse,
  OngiCommentResponse,
  OngiPhotoListResponse,
  OngiPhotoResponse,
} from '@/ongi/photo/presentation/dto/response/ongi-photo.response';

@RestApiController('/ongi', 'Ongi Photo')
export class OngiPhotoController {
  constructor(
    private readonly scanFeedUseCase: OngiScanFeedUseCase,
    private readonly scanAlbumPhotosUseCase: OngiScanAlbumPhotosUseCase,
    private readonly scanPersonPhotosUseCase: OngiScanPersonPhotosUseCase,
    private readonly getPhotoUseCase: OngiGetPhotoUseCase,
    private readonly toggleLikeUseCase: OngiToggleLikeUseCase,
    private readonly scanCommentsUseCase: OngiScanCommentsUseCase,
    private readonly addCommentUseCase: OngiAddCommentUseCase,
    private readonly uploadPhotosUseCase: OngiUploadPhotosUseCase,
  ) {}

  @RestApiGet(OngiPhotoListResponse, { path: '/groups/:groupId/photos', description: '그룹 피드 (최신순)', auth: [USER_TYPE.CLIENT] })
  async scanFeed(@AuthSignature() signature: UserSignature, @Param('groupId', ParseIntPipe) groupId: number) {
    const views = await this.scanFeedUseCase.execute(signature.id, groupId);

    return new OngiPhotoListResponse(views);
  }

  @RestApiGet(OngiPhotoListResponse, { path: '/albums/:albumId/photos', description: '앨범에 담긴 사진 (최신순)', auth: [USER_TYPE.CLIENT] })
  async scanAlbumPhotos(@AuthSignature() signature: UserSignature, @Param('albumId', ParseIntPipe) albumId: number) {
    const views = await this.scanAlbumPhotosUseCase.execute(signature.id, albumId);

    return new OngiPhotoListResponse(views);
  }

  @RestApiGet(OngiPhotoListResponse, { path: '/people/:personId/photos', description: '인물이 태그된 사진 (최신순)', auth: [USER_TYPE.CLIENT] })
  async scanPersonPhotos(@AuthSignature() signature: UserSignature, @Param('personId', ParseIntPipe) personId: number) {
    const views = await this.scanPersonPhotosUseCase.execute(signature.id, personId);

    return new OngiPhotoListResponse(views);
  }

  @RestApiPost(OngiPhotoListResponse, { path: '/photos', description: '사진 올리기 (여러 그룹 동시 게시)', auth: [USER_TYPE.CLIENT] })
  async uploadPhotos(@AuthSignature() signature: UserSignature, @Body() request: OngiUploadPhotosRequest) {
    const views = await this.uploadPhotosUseCase.execute(signature.id, request.toCommand());

    return new OngiPhotoListResponse(views);
  }

  @RestApiGet(OngiPhotoResponse, { path: '/photos/:photoId', description: '사진 상세 조회', auth: [USER_TYPE.CLIENT] })
  async getPhoto(@AuthSignature() signature: UserSignature, @Param('photoId', ParseIntPipe) photoId: number) {
    const view = await this.getPhotoUseCase.execute(signature.id, photoId);

    return new OngiPhotoResponse(view);
  }

  @RestApiPost(OngiPhotoResponse, { path: '/photos/:photoId/like', description: '따뜻해요 토글', auth: [USER_TYPE.CLIENT] })
  async toggleLike(@AuthSignature() signature: UserSignature, @Param('photoId', ParseIntPipe) photoId: number) {
    const view = await this.toggleLikeUseCase.execute(signature.id, photoId);

    return new OngiPhotoResponse(view);
  }

  @RestApiGet(OngiCommentListResponse, { path: '/photos/:photoId/comments', description: '사진 댓글 목록', auth: [USER_TYPE.CLIENT] })
  async scanComments(@AuthSignature() signature: UserSignature, @Param('photoId', ParseIntPipe) photoId: number) {
    const comments = await this.scanCommentsUseCase.execute(signature.id, photoId);

    return new OngiCommentListResponse(comments);
  }

  @RestApiPost(OngiCommentResponse, { path: '/photos/:photoId/comments', description: '사진에 댓글 달기', auth: [USER_TYPE.CLIENT] })
  async addComment(@AuthSignature() signature: UserSignature, @Param('photoId', ParseIntPipe) photoId: number, @Body() request: OngiAddCommentRequest) {
    const comment = await this.addCommentUseCase.execute(signature.id, photoId, request.text.trim());

    return new OngiCommentResponse(comment);
  }
}
