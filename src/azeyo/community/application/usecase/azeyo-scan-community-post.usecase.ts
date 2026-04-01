import { Inject, Injectable } from '@nestjs/common';
import { AZEYO_COMMUNITY_POST_REPOSITORY, IAzeyoCommunityPostRepository } from '@/azeyo/community/domain/repository/azeyo-community-post.repository.interface';
import { AZEYO_COMMUNITY_LIKE_REPOSITORY, IAzeyoCommunityLikeRepository } from '@/azeyo/community/domain/repository/azeyo-community-like.repository.interface';
import { AZEYO_COMMUNITY_VOTE_REPOSITORY, IAzeyoCommunityVoteRepository } from '@/azeyo/community/domain/repository/azeyo-community-vote.repository.interface';
import { AzeyoCommunityPost } from '@/azeyo/community/domain/entity/azeyo-community-post.entity';

@Injectable()
export class AzeyoScanCommunityPostUseCase {
  constructor(
    @Inject(AZEYO_COMMUNITY_POST_REPOSITORY) private readonly postRepository: IAzeyoCommunityPostRepository,
    @Inject(AZEYO_COMMUNITY_LIKE_REPOSITORY) private readonly likeRepository: IAzeyoCommunityLikeRepository,
    @Inject(AZEYO_COMMUNITY_VOTE_REPOSITORY) private readonly voteRepository: IAzeyoCommunityVoteRepository,
  ) {}

  async execute(postId: number, userId?: number): Promise<AzeyoCommunityPost> {
    const post = await this.postRepository.findOneByIdWithUserOrThrow(postId);
    await this.postRepository.incrementViewCount(postId);

    const [voteCountA, voteCountB, likeCounts] = await Promise.all([
      this.voteRepository.countByPostIdAndOption(postId, 'A'),
      this.voteRepository.countByPostIdAndOption(postId, 'B'),
      this.likeRepository.countByTargetIds([postId]),
    ]);

    post.voteCountA = voteCountA;
    post.voteCountB = voteCountB;
    post.likesCount = likeCounts[0]?.count ? Number(likeCounts[0].count) : 0;

    if (userId) {
      const [like, vote] = await Promise.all([
        this.likeRepository.findByTargetIdAndUserId(postId, userId),
        this.voteRepository.findByPostIdAndUserId(postId, userId),
      ]);
      if (like) post.isLiked = true;
      if (vote) post.userVote = vote.option;
    }

    return post;
  }
}
