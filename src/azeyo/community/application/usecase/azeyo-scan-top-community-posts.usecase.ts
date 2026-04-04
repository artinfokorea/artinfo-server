import { Inject, Injectable } from '@nestjs/common';
import { AZEYO_COMMUNITY_POST_REPOSITORY, IAzeyoCommunityPostRepository } from '@/azeyo/community/domain/repository/azeyo-community-post.repository.interface';
import { AZEYO_COMMUNITY_LIKE_REPOSITORY, IAzeyoCommunityLikeRepository } from '@/azeyo/community/domain/repository/azeyo-community-like.repository.interface';
import { AZEYO_COMMUNITY_VOTE_REPOSITORY, IAzeyoCommunityVoteRepository } from '@/azeyo/community/domain/repository/azeyo-community-vote.repository.interface';
import { AzeyoCommunityPost } from '@/azeyo/community/domain/entity/azeyo-community-post.entity';

@Injectable()
export class AzeyoScanTopCommunityPostsUseCase {
  constructor(
    @Inject(AZEYO_COMMUNITY_POST_REPOSITORY) private readonly postRepository: IAzeyoCommunityPostRepository,
    @Inject(AZEYO_COMMUNITY_LIKE_REPOSITORY) private readonly likeRepository: IAzeyoCommunityLikeRepository,
    @Inject(AZEYO_COMMUNITY_VOTE_REPOSITORY) private readonly voteRepository: IAzeyoCommunityVoteRepository,
  ) {}

  async execute(userId: number | null): Promise<{ items: AzeyoCommunityPost[]; totalCount: number }> {
    const items = await this.postRepository.findTop();
    if (items.length === 0) return { items, totalCount: 0 };

    if (userId) {
      const postIds = items.map(item => item.id);
      const [likes, userVotes] = await Promise.all([
        this.likeRepository.findManyByTargetIdsAndUserId(postIds, userId),
        this.voteRepository.findUserVotesForPosts(postIds, userId),
      ]);

      const likedSet = new Set(likes.map(l => l.targetId));
      const userVoteMap = new Map(userVotes.map(v => [v.postId, v.option]));

      items.forEach(item => {
        if (likedSet.has(item.id)) item.isLiked = true;
        item.userVote = userVoteMap.get(item.id) ?? null;
      });
    }

    return { items, totalCount: items.length };
  }
}
