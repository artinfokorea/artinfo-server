import { Body, Param, Query, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiConsumes } from '@nestjs/swagger';
import { RestApiController, RestApiGet, RestApiPost, RestApiPut, RestApiDelete } from '@/common/decorator/rest-api';
import { AuthSignature } from '@/common/decorator/AuthSignature';
import { Signature } from '@/common/decorator/Signature';
import { UserSignature, UploadFile } from '@/common/type/type';
import { USER_TYPE } from '@/user/entity/user.entity';
import { OkResponse } from '@/common/response/ok.response';
import { CreateResponse } from '@/common/response/createResponse';
import { AzeyoCreateCommunityPostUseCase } from '@/azeyo/community/application/usecase/azeyo-create-community-post.usecase';
import { AzeyoScanCommunityPostsUseCase } from '@/azeyo/community/application/usecase/azeyo-scan-community-posts.usecase';
import { AzeyoScanCommunityPostUseCase } from '@/azeyo/community/application/usecase/azeyo-scan-community-post.usecase';
import { AzeyoEditCommunityPostUseCase } from '@/azeyo/community/application/usecase/azeyo-edit-community-post.usecase';
import { AzeyoRemoveCommunityPostUseCase } from '@/azeyo/community/application/usecase/azeyo-remove-community-post.usecase';
import { AzeyoVoteCommunityPostUseCase } from '@/azeyo/community/application/usecase/azeyo-vote-community-post.usecase';
import { AzeyoLikeCommunityPostUseCase } from '@/azeyo/community/application/usecase/azeyo-like-community-post.usecase';
import { AzeyoUploadCommunityImagesUseCase } from '@/azeyo/community/application/usecase/azeyo-upload-community-images.usecase';
import { AzeyoCreateCommunityCommentUseCase } from '@/azeyo/community/application/usecase/azeyo-create-community-comment.usecase';
import { AzeyoScanCommunityCommentsUseCase } from '@/azeyo/community/application/usecase/azeyo-scan-community-comments.usecase';
import { AzeyoDeleteCommunityCommentUseCase } from '@/azeyo/community/application/usecase/azeyo-delete-community-comment.usecase';
import { AzeyoCreateCommunityPostRequest } from '@/azeyo/community/presentation/dto/request/azeyo-create-community-post.request';
import { AzeyoEditCommunityPostRequest } from '@/azeyo/community/presentation/dto/request/azeyo-edit-community-post.request';
import { AzeyoScanCommunityPostsRequest } from '@/azeyo/community/presentation/dto/request/azeyo-scan-community-posts.request';
import { AzeyoCreateCommunityCommentRequest, AzeyoScanCommunityCommentsRequest } from '@/azeyo/community/presentation/dto/request/azeyo-community-comment.request';
import { AzeyoCommunityPostResponse, AzeyoCommunityPostsResponse } from '@/azeyo/community/presentation/dto/response/azeyo-community-post.response';
import { AzeyoCommunityCommentsResponse } from '@/azeyo/community/presentation/dto/response/azeyo-community-comment.response';
import { AzeyoUploadImagesResponse } from '@/azeyo/community/presentation/dto/response/azeyo-upload-images.response';

@RestApiController('/azeyo/communities', 'Azeyo Community')
export class AzeyoCommunityController {
  constructor(
    private readonly createPostUseCase: AzeyoCreateCommunityPostUseCase,
    private readonly scanPostsUseCase: AzeyoScanCommunityPostsUseCase,
    private readonly scanPostUseCase: AzeyoScanCommunityPostUseCase,
    private readonly editPostUseCase: AzeyoEditCommunityPostUseCase,
    private readonly removePostUseCase: AzeyoRemoveCommunityPostUseCase,
    private readonly votePostUseCase: AzeyoVoteCommunityPostUseCase,
    private readonly likePostUseCase: AzeyoLikeCommunityPostUseCase,
    private readonly uploadImagesUseCase: AzeyoUploadCommunityImagesUseCase,
    private readonly createCommentUseCase: AzeyoCreateCommunityCommentUseCase,
    private readonly scanCommentsUseCase: AzeyoScanCommunityCommentsUseCase,
    private readonly deleteCommentUseCase: AzeyoDeleteCommunityCommentUseCase,
  ) {}

  // === Posts ===

  @RestApiGet(AzeyoCommunityPostsResponse, { path: '/top', description: '인기 게시글 조회' })
  async scanTopPosts() {
    const posts = await this.scanPostsUseCase.execute({ userId: null, page: 1, size: 10, category: null, keyword: null });
    return new AzeyoCommunityPostsResponse(posts);
  }

  @RestApiGet(AzeyoCommunityPostsResponse, { path: '/', description: '게시글 목록 조회' })
  async scanPosts(@Signature() signature: UserSignature, @Query() request: AzeyoScanCommunityPostsRequest) {
    const result = await this.scanPostsUseCase.execute({
      userId: signature?.id ?? null,
      page: request.page,
      size: request.size,
      category: request.category,
      keyword: request.keyword,
    });
    return new AzeyoCommunityPostsResponse(result);
  }

  @RestApiGet(AzeyoCommunityPostResponse, { path: '/:postId', description: '게시글 단건 조회' })
  async scanPost(@Signature() signature: UserSignature, @Param('postId') postId: number) {
    const post = await this.scanPostUseCase.execute(postId, signature?.id);
    return new AzeyoCommunityPostResponse(post);
  }

  @RestApiPost(OkResponse, { path: '/', description: '게시글 작성', auth: [USER_TYPE.CLIENT] })
  async createPost(@AuthSignature() signature: UserSignature, @Body() request: AzeyoCreateCommunityPostRequest) {
    await this.createPostUseCase.execute(request.toCommand(signature.id));
    return new OkResponse();
  }

  @RestApiPut(OkResponse, { path: '/:postId', description: '게시글 수정', auth: [USER_TYPE.CLIENT] })
  async editPost(@AuthSignature() signature: UserSignature, @Param('postId') postId: number, @Body() request: AzeyoEditCommunityPostRequest) {
    await this.editPostUseCase.execute({
      userId: signature.id,
      postId,
      category: request.category,
      title: request.title,
      contents: request.contents,
      imageUrls: request.imageUrls ?? null,
      imageRatio: request.imageRatio ?? null,
      voteOptionA: request.voteOptionA ?? null,
      voteOptionB: request.voteOptionB ?? null,
    });
    return new OkResponse();
  }

  @RestApiDelete(OkResponse, { path: '/:postId', description: '게시글 삭제', auth: [USER_TYPE.CLIENT] })
  async removePost(@AuthSignature() signature: UserSignature, @Param('postId') postId: number) {
    await this.removePostUseCase.execute(signature.id, postId);
    return new OkResponse();
  }

  @RestApiPost(OkResponse, { path: '/:postId/vote', description: '게시글 투표', auth: [USER_TYPE.CLIENT] })
  async votePost(@AuthSignature() signature: UserSignature, @Param('postId') postId: number, @Body('option') option: 'A' | 'B') {
    await this.votePostUseCase.execute(signature.id, postId, option);
    return new OkResponse();
  }

  @RestApiPost(OkResponse, { path: '/:postId/like', description: '게시글 좋아요', auth: [USER_TYPE.CLIENT] })
  async likePost(@AuthSignature() signature: UserSignature, @Param('postId') postId: number, @Body('isLike') isLike: boolean) {
    await this.likePostUseCase.execute(signature.id, postId, isLike);
    return new OkResponse();
  }

  // === Images ===

  @RestApiPost(AzeyoUploadImagesResponse, { path: '/upload/images', description: '커뮤니티 이미지 업로드', auth: [USER_TYPE.CLIENT] })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('imageFiles', 5, { limits: { fileSize: 32 * 1024 * 1024, files: 5 } }))
  async uploadImages(@AuthSignature() signature: UserSignature, @UploadedFiles() files: UploadFile[]) {
    const urls = await this.uploadImagesUseCase.execute(signature.id, files);
    return new AzeyoUploadImagesResponse(urls);
  }

  // === Comments ===

  @RestApiGet(AzeyoCommunityCommentsResponse, { path: '/:postId/comments', description: '댓글 목록 조회' })
  async scanComments(@Param('postId') postId: number, @Query() request: AzeyoScanCommunityCommentsRequest) {
    const result = await this.scanCommentsUseCase.execute(postId, { parentId: request.parentId, page: request.page, size: request.size });
    return new AzeyoCommunityCommentsResponse(result.items, result.totalCount);
  }

  @RestApiPost(CreateResponse, { path: '/comments', description: '댓글 작성', auth: [USER_TYPE.CLIENT] })
  async createComment(@AuthSignature() signature: UserSignature, @Body() request: AzeyoCreateCommunityCommentRequest) {
    const id = await this.createCommentUseCase.execute({
      userId: signature.id,
      postId: request.postId,
      parentId: request.parentId ?? null,
      contents: request.contents,
    });
    return new CreateResponse(id);
  }

  @RestApiDelete(OkResponse, { path: '/comments/:commentId', description: '댓글 삭제', auth: [USER_TYPE.CLIENT] })
  async deleteComment(@AuthSignature() signature: UserSignature, @Param('commentId') commentId: number) {
    await this.deleteCommentUseCase.execute(commentId, signature.id);
    return new OkResponse();
  }
}
