import { Inject, Injectable } from '@nestjs/common';
import { AZEYO_COMMUNITY_POST_REPOSITORY, IAzeyoCommunityPostRepository } from '@/azeyo/community/domain/repository/azeyo-community-post.repository.interface';
import { AZEYO_COMMUNITY_CATEGORY } from '@/azeyo/community/domain/entity/azeyo-community-post.entity';

@Injectable()
export class AzeyoEditCommunityPostUseCase {
  constructor(
    @Inject(AZEYO_COMMUNITY_POST_REPOSITORY)
    private readonly postRepository: IAzeyoCommunityPostRepository,
  ) {}

  async execute(params: {
    userId: number;
    postId: number;
    category: AZEYO_COMMUNITY_CATEGORY;
    title: string;
    contents: string;
    imageUrls: string[] | null;
    imageRatio: string | null;
    voteOptionA: string | null;
    voteOptionB: string | null;
  }): Promise<void> {
    const post = await this.postRepository.findOneByIdAndUserIdOrThrow(params.postId, params.userId);
    post.category = params.category;
    post.title = params.title;
    post.contents = params.contents;
    post.imageUrls = params.imageUrls;
    post.imageRatio = params.imageRatio;
    post.voteOptionA = params.voteOptionA;
    post.voteOptionB = params.voteOptionB;
    await this.postRepository.saveEntity(post);
  }
}
