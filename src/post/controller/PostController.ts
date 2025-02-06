import { RestApiController, RestApiDelete, RestApiGet, RestApiPost } from '@/common/decorator/rest-api';
import { OkResponse } from '@/common/response/ok.response';
import { USER_TYPE } from '@/user/entity/user.entity';
import { Signature } from '@/common/decorator/signature';
import { UserSignature } from '@/common/type/type';
import { Body, Param } from '@nestjs/common';
import { PostService } from '@/post/service/PostService';
import { CreatePostRequest } from '@/post/controller/dto/request/CreatePostRequest';
import { PostResponse } from '@/post/controller/dto/response/PostResponse';

@RestApiController('/posts', 'Post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @RestApiGet(PostResponse, { path: '/:postId', description: '글 단건 조회', auth: [USER_TYPE.CLIENT] })
  async scanPost(@Signature() signature: UserSignature, @Param('postId') postId: number): Promise<PostResponse> {
    const post = await this.postService.scanPostById(postId, signature?.id);
    return new PostResponse(post);
  }

  @RestApiPost(OkResponse, { path: '/', description: '글 작성', auth: [USER_TYPE.CLIENT] })
  async editLesson(@Signature() signature: UserSignature, @Body() request: CreatePostRequest): Promise<OkResponse> {
    await this.postService.createPost(request.toServiceDto(signature.id));
    return new OkResponse();
  }

  @RestApiDelete(OkResponse, { path: '/:postId', description: '글 삭제', auth: [USER_TYPE.CLIENT] })
  async removePost(@Signature() signature: UserSignature, @Param('postId') postId: number): Promise<OkResponse> {
    await this.postService.removePost(signature.id, postId);
    return new OkResponse();
  }
}
