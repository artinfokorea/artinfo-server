import { Inject, Injectable } from '@nestjs/common';
import { AZEYO_COMMUNITY_POST_REPOSITORY, IAzeyoCommunityPostRepository } from '@/azeyo/community/domain/repository/azeyo-community-post.repository.interface';
import { AZEYO_COMMUNITY_LIKE_REPOSITORY, IAzeyoCommunityLikeRepository } from '@/azeyo/community/domain/repository/azeyo-community-like.repository.interface';
import { AZEYO_COMMUNITY_COMMENT_REPOSITORY, IAzeyoCommunityCommentRepository } from '@/azeyo/community/domain/repository/azeyo-community-comment.repository.interface';
import { AZEYO_COMMUNITY_VOTE_REPOSITORY, IAzeyoCommunityVoteRepository } from '@/azeyo/community/domain/repository/azeyo-community-vote.repository.interface';
import { AzeyoCommunityPost } from '@/azeyo/community/domain/entity/azeyo-community-post.entity';

@Injectable()
export class AzeyoScanMyPostsUseCase {
  constructor(
    @Inject(AZEYO_COMMUNITY_POST_REPOSITORY) private readonly postRepository: IAzeyoCommunityPostRepository,
    @Inject(AZEYO_COMMUNITY_LIKE_REPOSITORY) private readonly likeRepository: IAzeyoCommunityLikeRepository,
    @Inject(AZEYO_COMMUNITY_COMMENT_REPOSITORY) private readonly commentRepository: IAzeyoCommunityCommentRepository,
    @Inject(AZEYO_COMMUNITY_VOTE_REPOSITORY) private readonly voteRepository: IAzeyoCommunityVoteRepository,
  ) {}

  async execute(userId: number, page: number, size: number): Promise<{ items: AzeyoCommunityPost[]; totalCount: number }> {
    const result = await this.postRepository.findManyByUserId(userId, (page - 1) * size, size);

    const postIds = result.items.map(item => item.id);
    if (postIds.length === 0) return result;

    const [likeCounts, voteCounts, commentCounts] = await Promise.all([
      this.likeRepository.countByTargetIds(postIds),
      this.voteRepository.countVotesForPosts(postIds),
      this.commentRepository.countByPostIds(postIds),
    ]);

    const likeMap = new Map(likeCounts.map(r => [r.targetId, Number(r.count)]));
    const commentMap = new Map(commentCounts.map(r => [r.postId, Number(r.count)]));
    const voteMap = new Map<string, number>();
    voteCounts.forEach(r => voteMap.set(`${r.postId}_${r.option}`, Number(r.count)));

    result.items.forEach(item => {
      item.likesCount = likeMap.get(item.id) ?? 0;
      item.commentsCount = commentMap.get(item.id) ?? 0;
      item.voteCountA = voteMap.get(`${item.id}_A`) ?? 0;
      item.voteCountB = voteMap.get(`${item.id}_B`) ?? 0;
    });

    return result;
  }
}
