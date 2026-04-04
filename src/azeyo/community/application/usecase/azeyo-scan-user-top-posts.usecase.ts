import { Inject, Injectable } from '@nestjs/common';
import { AZEYO_COMMUNITY_POST_REPOSITORY, IAzeyoCommunityPostRepository } from '@/azeyo/community/domain/repository/azeyo-community-post.repository.interface';
import { AzeyoCommunityPost } from '@/azeyo/community/domain/entity/azeyo-community-post.entity';

@Injectable()
export class AzeyoScanUserTopPostsUseCase {
  constructor(
    @Inject(AZEYO_COMMUNITY_POST_REPOSITORY) private readonly postRepository: IAzeyoCommunityPostRepository,
  ) {}

  async execute(userId: number, count: number): Promise<{ items: AzeyoCommunityPost[]; totalCount: number }> {
    const items = await this.postRepository.findTopByUserId(userId, count);
    return { items, totalCount: items.length };
  }
}
