import { Body, Param, ParseIntPipe, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiConsumes } from '@nestjs/swagger';
import { RestApiController, RestApiDelete, RestApiGet, RestApiPost } from '@/common/decorator/rest-api';
import { OkResponse } from '@/common/response/ok.response';
import { UploadFile } from '@/common/type/type';
import { AuthSignature } from '@/common/decorator/AuthSignature';
import { UserSignature } from '@/common/type/type';
import { USER_TYPE } from '@/user/entity/user.entity';
import {
  OngiAddCommentUseCase,
  OngiDeleteCommentUseCase,
  OngiDeletePhotoUseCase,
  OngiGetPhotoUseCase,
  OngiScanAlbumPhotosUseCase,
  OngiScanCommentsUseCase,
  OngiScanFeedUseCase,
  OngiScanPersonPhotosUseCase,
  OngiScanUnfiledPhotosUseCase,
  OngiToggleLikeUseCase,
  OngiUploadPhotoFilesUseCase,
  OngiUploadPhotosUseCase,
} from '@/ongi/photo/application/usecase/ongi-photo.usecase';
import { OngiUploadPhotosRequest } from '@/ongi/photo/presentation/dto/request/ongi-upload-photos.request';
import { OngiAddCommentRequest } from '@/ongi/photo/presentation/dto/request/ongi-add-comment.request';
import {
  OngiCommentListResponse,
  OngiCommentResponse,
  OngiPhotoListResponse,
  OngiPhotoResponse,
  OngiUploadedPhotoFilesResponse,
} from '@/ongi/photo/presentation/dto/response/ongi-photo.response';

@RestApiController('/ongi', 'Ongi Photo')
export class OngiPhotoController {
  constructor(
    private readonly scanFeedUseCase: OngiScanFeedUseCase,
    private readonly scanAlbumPhotosUseCase: OngiScanAlbumPhotosUseCase,
    private readonly scanPersonPhotosUseCase: OngiScanPersonPhotosUseCase,
    private readonly scanUnfiledPhotosUseCase: OngiScanUnfiledPhotosUseCase,
    private readonly getPhotoUseCase: OngiGetPhotoUseCase,
    private readonly toggleLikeUseCase: OngiToggleLikeUseCase,
    private readonly scanCommentsUseCase: OngiScanCommentsUseCase,
    private readonly addCommentUseCase: OngiAddCommentUseCase,
    private readonly uploadPhotosUseCase: OngiUploadPhotosUseCase,
    private readonly uploadPhotoFilesUseCase: OngiUploadPhotoFilesUseCase,
    private readonly deletePhotoUseCase: OngiDeletePhotoUseCase,
    private readonly deleteCommentUseCase: OngiDeleteCommentUseCase,
  ) {}

  @RestApiGet(OngiPhotoListResponse, { path: '/groups/:groupId/photos', description: '그룹 피드 (최신순)', auth: [USER_TYPE.CLIENT] })
  async scanFeed(@AuthSignature() signature: UserSignature, @Param('groupId', ParseIntPipe) groupId: number) {
    const views = await this.scanFeedUseCase.execute(signature.id, groupId);

    return new OngiPhotoListResponse(views);
  }

  @RestApiGet(OngiPhotoListResponse, { path: '/groups/:groupId/photos/unfiled', description: '앨범에 담기지 않은 사진 (최신순)', auth: [USER_TYPE.CLIENT] })
  async scanUnfiledPhotos(@AuthSignature() signature: UserSignature, @Param('groupId', ParseIntPipe) groupId: number) {
    const views = await this.scanUnfiledPhotosUseCase.execute(signature.id, groupId);

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

  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FilesInterceptor('photoFiles', 10, {
      limits: {
        fileSize: 32 * 1024 * 1024,
        files: 10,
      },
    }),
  )
  @RestApiPost(OngiUploadedPhotoFilesResponse, {
    path: '/photos/files',
    description: '사진 파일 업로드 (S3) — 게시 전에 URL 을 받는다',
    auth: [USER_TYPE.CLIENT],
  })
  async uploadPhotoFiles(@AuthSignature() signature: UserSignature, @UploadedFiles() files: UploadFile[]) {
    const views = await this.uploadPhotoFilesUseCase.execute(signature.id, files ?? []);

    return new OngiUploadedPhotoFilesResponse(views);
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

  @RestApiDelete(OkResponse, { path: '/photos/:photoId', description: '사진 삭제 (작성자 또는 관리자) — 댓글도 함께 삭제', auth: [USER_TYPE.CLIENT] })
  async deletePhoto(@AuthSignature() signature: UserSignature, @Param('photoId', ParseIntPipe) photoId: number) {
    await this.deletePhotoUseCase.execute(signature.id, photoId);

    return new OkResponse();
  }

  @RestApiDelete(OkResponse, {
    path: '/photos/:photoId/comments/:commentId',
    description: '댓글 삭제 (댓글 작성자·사진 작성자·관리자)',
    auth: [USER_TYPE.CLIENT],
  })
  async deleteComment(
    @AuthSignature() signature: UserSignature,
    @Param('photoId', ParseIntPipe) photoId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
  ) {
    await this.deleteCommentUseCase.execute(signature.id, photoId, commentId);

    return new OkResponse();
  }
}
