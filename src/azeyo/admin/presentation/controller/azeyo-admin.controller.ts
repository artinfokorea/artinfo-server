import { Body, Param, Query } from '@nestjs/common';
import { RestApiController, RestApiGet, RestApiPost, RestApiPut, RestApiDelete } from '@/common/decorator/rest-api';
import { AuthSignature } from '@/common/decorator/AuthSignature';
import { UserSignature } from '@/common/type/type';
import { USER_TYPE } from '@/user/entity/user.entity';
import { OkResponse } from '@/common/response/ok.response';
import { CreateResponse } from '@/common/response/createResponse';
import { Inject } from '@nestjs/common';
import { AZEYO_USER_REPOSITORY, IAzeyoUserRepository } from '@/azeyo/user/domain/repository/azeyo-user.repository.interface';
import { AZEYO_COMMUNITY_POST_REPOSITORY, IAzeyoCommunityPostRepository } from '@/azeyo/community/domain/repository/azeyo-community-post.repository.interface';
import { AZEYO_COMMUNITY_COMMENT_REPOSITORY, IAzeyoCommunityCommentRepository } from '@/azeyo/community/domain/repository/azeyo-community-comment.repository.interface';
import { AZEYO_COMMUNITY_POST_TYPE, AZEYO_COMMUNITY_CATEGORY } from '@/azeyo/community/domain/entity/azeyo-community-post.entity';
import { ForbiddenException } from '@nestjs/common';

@RestApiController('/azeyo/admin', 'Azeyo Admin')
export class AzeyoAdminController {
  constructor(
    @Inject(AZEYO_USER_REPOSITORY)
    private readonly userRepository: IAzeyoUserRepository,
    @Inject(AZEYO_COMMUNITY_POST_REPOSITORY)
    private readonly postRepository: IAzeyoCommunityPostRepository,
    @Inject(AZEYO_COMMUNITY_COMMENT_REPOSITORY)
    private readonly commentRepository: IAzeyoCommunityCommentRepository,
  ) {}

  private async assertAdmin(signature: UserSignature): Promise<void> {
    const user = await this.userRepository.findOneOrThrowById(signature.id);
    if (!user.isAdmin) throw new ForbiddenException('관리자만 접근할 수 있습니다');
  }

  // 유저 목록 조회
  @RestApiGet(OkResponse, { path: '/users', description: '[Admin] 유저 목록 조회', auth: [USER_TYPE.CLIENT] })
  async listUsers(
    @AuthSignature() signature: UserSignature,
    @Query('page') page: number = 1,
    @Query('size') size: number = 20,
  ) {
    await this.assertAdmin(signature);
    const result = await this.userRepository.findAllPaging((page - 1) * size, size);
    return {
      users: result.items.map(u => ({
        id: u.id,
        nickname: u.nickname,
        iconImageUrl: u.iconImageUrl,
        activityPoints: u.activityPoints,
        createdAt: u.createdAt,
        isWriteBanned: u.isWriteBanned,
      })),
      totalCount: result.totalCount,
    };
  }

  // 특정 유저로 게시글 작성
  @RestApiPost(CreateResponse, { path: '/posts', description: '[Admin] 유저 대리 게시글 작성', auth: [USER_TYPE.CLIENT] })
  async createPostAsUser(
    @AuthSignature() signature: UserSignature,
    @Body() body: {
      userId: number;
      type: AZEYO_COMMUNITY_POST_TYPE;
      category: AZEYO_COMMUNITY_CATEGORY;
      title: string;
      contents: string;
      imageUrls?: string[] | null;
      imageRatio?: string | null;
      voteOptionA?: string | null;
      voteOptionB?: string | null;
    },
  ) {
    await this.assertAdmin(signature);
    const post = await this.postRepository.create({
      userId: body.userId,
      type: body.type,
      category: body.category,
      title: body.title,
      contents: body.contents,
      imageUrls: body.imageUrls ?? null,
      imageRatio: body.imageRatio ?? null,
      voteOptionA: body.voteOptionA ?? null,
      voteOptionB: body.voteOptionB ?? null,
    });
    return new CreateResponse(post.id);
  }

  // 특정 유저로 댓글 작성
  @RestApiPost(CreateResponse, { path: '/comments', description: '[Admin] 유저 대리 댓글 작성', auth: [USER_TYPE.CLIENT] })
  async createCommentAsUser(
    @AuthSignature() signature: UserSignature,
    @Body() body: { userId: number; postId: number; parentId?: number | null; contents: string },
  ) {
    await this.assertAdmin(signature);
    const comment = await this.commentRepository.create({
      userId: body.userId,
      postId: body.postId,
      parentId: body.parentId ?? null,
      contents: body.contents,
    });
    return new CreateResponse(comment.id);
  }

  // 게시글 수정 (소유자 무관)
  @RestApiPut(OkResponse, { path: '/posts/:postId', description: '[Admin] 게시글 수정', auth: [USER_TYPE.CLIENT] })
  async editPost(
    @AuthSignature() signature: UserSignature,
    @Param('postId') postId: number,
    @Body() body: {
      category?: AZEYO_COMMUNITY_CATEGORY;
      title?: string;
      contents?: string;
      imageUrls?: string[] | null;
      imageRatio?: string | null;
      voteOptionA?: string | null;
      voteOptionB?: string | null;
    },
  ) {
    await this.assertAdmin(signature);
    const post = await this.postRepository.findOneByIdOrThrow(postId);
    if (body.category !== undefined) post.category = body.category;
    if (body.title !== undefined) post.title = body.title;
    if (body.contents !== undefined) post.contents = body.contents;
    if (body.imageUrls !== undefined) post.imageUrls = body.imageUrls;
    if (body.imageRatio !== undefined) post.imageRatio = body.imageRatio;
    if (body.voteOptionA !== undefined) post.voteOptionA = body.voteOptionA;
    if (body.voteOptionB !== undefined) post.voteOptionB = body.voteOptionB;
    await this.postRepository.saveEntity(post);
    return new OkResponse();
  }

  // 게시글 삭제 (소유자 무관)
  @RestApiDelete(OkResponse, { path: '/posts/:postId', description: '[Admin] 게시글 삭제', auth: [USER_TYPE.CLIENT] })
  async deletePost(
    @AuthSignature() signature: UserSignature,
    @Param('postId') postId: number,
  ) {
    await this.assertAdmin(signature);
    const post = await this.postRepository.findOneByIdOrThrow(postId);
    await this.postRepository.softRemove(post);
    return new OkResponse();
  }

  // 전체 게시글 목록 (admin용 - 검색/필터)
  @RestApiGet(OkResponse, { path: '/posts', description: '[Admin] 전체 게시글 조회', auth: [USER_TYPE.CLIENT] })
  async listPosts(
    @AuthSignature() signature: UserSignature,
    @Query('page') page: number = 1,
    @Query('size') size: number = 20,
    @Query('category') category?: AZEYO_COMMUNITY_CATEGORY,
    @Query('keyword') keyword?: string,
  ) {
    await this.assertAdmin(signature);
    const result = await this.postRepository.findManyPaging({
      skip: (page - 1) * size,
      take: size,
      category: category ?? null,
      keyword: keyword ?? null,
    });
    return {
      posts: result.items.map(p => ({
        id: p.id,
        type: p.type,
        category: p.category,
        userId: p.userId,
        authorName: p.user?.nickname ?? '',
        authorIconImageUrl: p.user?.iconImageUrl ?? null,
        title: p.title,
        contents: p.contents,
        imageUrls: p.imageUrls,
        imageRatio: p.imageRatio,
        voteOptionA: p.voteOptionA,
        voteOptionB: p.voteOptionB,
        viewCount: p.viewCount,
        createdAt: p.createdAt,
      })),
      totalCount: result.totalCount,
    };
  }
}
