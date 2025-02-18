import { RestApiController, RestApiDelete, RestApiGet, RestApiPost } from '@/common/decorator/rest-api';
import { OkResponse } from '@/common/response/ok.response';
import { USER_TYPE } from '@/user/entity/user.entity';
import { AuthSignature } from '@/common/decorator/AuthSignature';
import { UserSignature } from '@/common/type/type';
import { Body, Param, Query } from '@nestjs/common';
import { PostService } from '@/post/service/PostService';
import { CreatePostRequest } from '@/post/controller/dto/request/CreatePostRequest';
import { PostResponse } from '@/post/controller/dto/response/PostResponse';
import { Signature } from '@/common/decorator/Signature';
import { EditPostRequest } from '@/post/controller/dto/request/EditPostRequest';
import { ScanPostsRequest } from '@/post/controller/dto/request/ScanPostsRequest';
import { PostsResponse } from '@/post/controller/dto/response/PostsResponse';
import { LikePostRequest } from '@/post/controller/dto/request/LikePostRequest';
import { TopPostsResponse } from '@/post/controller/dto/response/TopPostsResponse';

@RestApiController('/posts', 'Post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @RestApiGet(TopPostsResponse, { path: '/top', description: '인기 게시글 조회' })
  async scanTopPosts(): Promise<TopPostsResponse> {
    return new TopPostsResponse(await this.postService.scanTopPosts());
  }

  @RestApiGet(PostResponse, { path: '/:postId', description: '글 단건 조회' })
  async scanPost(@Signature() signature: UserSignature, @Param('postId') postId: number): Promise<PostResponse> {
    const post = await this.postService.scanPostById(postId, signature?.id);
    return new PostResponse(post);
  }

  @RestApiGet(PostsResponse, { path: '/', description: '글 목록 조회' })
  async scanPosts(@Signature() signature: UserSignature, @Query() request: ScanPostsRequest): Promise<PostsResponse> {
    const pagingitems = await this.postService.scanPosts(request.toServiceDto(signature?.id));
    return new PostsResponse({ posts: pagingitems.items, totalCount: pagingitems.totalCount });
  }

  @RestApiPost(OkResponse, { path: '/', description: '글 작성', auth: [USER_TYPE.CLIENT] })
  async createPost(@AuthSignature() signature: UserSignature, @Body() request: CreatePostRequest): Promise<OkResponse> {
    await this.postService.createPost(request.toServiceDto(signature.id));
    return new OkResponse();
  }

  @RestApiPost(OkResponse, { path: '/:postId', description: '글 수정', auth: [USER_TYPE.CLIENT] })
  async editPost(@AuthSignature() signature: UserSignature, @Param('postId') postId: number, @Body() request: EditPostRequest): Promise<OkResponse> {
    await this.postService.editPost(request.toServiceDto(signature.id, postId));
    return new OkResponse();
  }

  @RestApiPost(OkResponse, { path: '/like/:postId', description: '글 좋아요', auth: [USER_TYPE.CLIENT] })
  async likePost(@AuthSignature() signature: UserSignature, @Param('postId') postId: number, @Body() request: LikePostRequest): Promise<OkResponse> {
    await this.postService.likePost(request.toServiceDto(signature.id, postId));
    return new OkResponse();
  }

  @RestApiDelete(OkResponse, { path: '/:postId', description: '글 삭제', auth: [USER_TYPE.CLIENT] })
  async removePost(@AuthSignature() signature: UserSignature, @Param('postId') postId: number): Promise<OkResponse> {
    await this.postService.removePost(signature.id, postId);
    return new OkResponse();
  }
}
