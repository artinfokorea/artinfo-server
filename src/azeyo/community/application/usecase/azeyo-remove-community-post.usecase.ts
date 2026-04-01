import { Inject, Injectable } from '@nestjs/common';
import { AZEYO_COMMUNITY_POST_REPOSITORY, IAzeyoCommunityPostRepository } from '@/azeyo/community/domain/repository/azeyo-community-post.repository.interface';

@Injectable()
export class AzeyoRemoveCommunityPostUseCase {
  constructor(
    @Inject(AZEYO_COMMUNITY_POST_REPOSITORY)
    private readonly postRepository: IAzeyoCommunityPostRepository,
  ) {}

  async execute(userId: number, postId: number): Promise<void> {
    const post = await this.postRepository.findOneByIdAndUserIdOrThrow(postId, userId);
    await this.postRepository.softRemove(post);
  }
}
