import { Inject, Injectable } from '@nestjs/common';
import { AZEYO_COMMUNITY_POST_REPOSITORY, IAzeyoCommunityPostRepository } from '@/azeyo/community/domain/repository/azeyo-community-post.repository.interface';
import { AZEYO_COMMUNITY_LIKE_REPOSITORY, IAzeyoCommunityLikeRepository } from '@/azeyo/community/domain/repository/azeyo-community-like.repository.interface';
import { AZEYO_COMMUNITY_VOTE_REPOSITORY, IAzeyoCommunityVoteRepository } from '@/azeyo/community/domain/repository/azeyo-community-vote.repository.interface';
import { AZEYO_COMMUNITY_COMMENT_REPOSITORY, IAzeyoCommunityCommentRepository } from '@/azeyo/community/domain/repository/azeyo-community-comment.repository.interface';
import { AzeyoCommunityPost, AZEYO_COMMUNITY_CATEGORY } from '@/azeyo/community/domain/entity/azeyo-community-post.entity';

@Injectable()
export class AzeyoScanCommunityPostsUseCase {
  constructor(
    @Inject(AZEYO_COMMUNITY_POST_REPOSITORY) private readonly postRepository: IAzeyoCommunityPostRepository,
    @Inject(AZEYO_COMMUNITY_LIKE_REPOSITORY) private readonly likeRepository: IAzeyoCommunityLikeRepository,
    @Inject(AZEYO_COMMUNITY_VOTE_REPOSITORY) private readonly voteRepository: IAzeyoCommunityVoteRepository,
    @Inject(AZEYO_COMMUNITY_COMMENT_REPOSITORY) private readonly commentRepository: IAzeyoCommunityCommentRepository,
  ) {}

  async execute(params: {
    userId: number | null;
    page: number;
    size: number;
    category: AZEYO_COMMUNITY_CATEGORY | null;
    keyword: string | null;
  }): Promise<{ items: AzeyoCommunityPost[]; totalCount: number }> {
    const skip = (params.page - 1) * params.size;
    const pagingItems = await this.postRepository.findManyPaging({
      skip,
      take: params.size,
      category: params.category,
      keyword: params.keyword,
    });

    const postIds = pagingItems.items.map(item => item.id);
    if (postIds.length === 0) return pagingItems;

    // Batch fetch counts
    const [likeCounts, voteCounts, commentCounts] = await Promise.all([
      this.likeRepository.countByTargetIds(postIds),
      this.voteRepository.countVotesForPosts(postIds),
      this.commentRepository.countByPostIds(postIds),
    ]);

    const likeMap = new Map(likeCounts.map(r => [r.targetId, Number(r.count)]));
    const commentMap = new Map(commentCounts.map(r => [r.postId, Number(r.count)]));
    const voteMap = new Map<string, number>();
    voteCounts.forEach(r => voteMap.set(`${r.postId}_${r.option}`, Number(r.count)));

    pagingItems.items.forEach(item => {
      item.likesCount = likeMap.get(item.id) ?? 0;
      item.commentsCount = commentMap.get(item.id) ?? 0;
      item.voteCountA = voteMap.get(`${item.id}_A`) ?? 0;
      item.voteCountB = voteMap.get(`${item.id}_B`) ?? 0;
    });

    if (params.userId) {
      const [likes, userVotes] = await Promise.all([
        this.likeRepository.findManyByTargetIdsAndUserId(postIds, params.userId),
        this.voteRepository.findUserVotesForPosts(postIds, params.userId),
      ]);

      const likedSet = new Set(likes.map(l => l.targetId));
      const userVoteMap = new Map(userVotes.map(v => [v.postId, v.option]));

      pagingItems.items.forEach(item => {
        if (likedSet.has(item.id)) item.isLiked = true;
        item.userVote = userVoteMap.get(item.id) ?? null;
      });
    }

    return pagingItems;
  }
}
