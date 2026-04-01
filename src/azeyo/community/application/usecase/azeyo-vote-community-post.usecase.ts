import { Inject, Injectable } from '@nestjs/common';
import { AZEYO_COMMUNITY_POST_REPOSITORY, IAzeyoCommunityPostRepository } from '@/azeyo/community/domain/repository/azeyo-community-post.repository.interface';
import { AZEYO_COMMUNITY_VOTE_REPOSITORY, IAzeyoCommunityVoteRepository } from '@/azeyo/community/domain/repository/azeyo-community-vote.repository.interface';
import { AzeyoCommunityNotVotePost } from '@/azeyo/community/domain/exception/azeyo-community.exception';
import { AZEYO_COMMUNITY_POST_TYPE } from '@/azeyo/community/domain/entity/azeyo-community-post.entity';

@Injectable()
export class AzeyoVoteCommunityPostUseCase {
  constructor(
    @Inject(AZEYO_COMMUNITY_POST_REPOSITORY) private readonly postRepository: IAzeyoCommunityPostRepository,
    @Inject(AZEYO_COMMUNITY_VOTE_REPOSITORY) private readonly voteRepository: IAzeyoCommunityVoteRepository,
  ) {}

  async execute(userId: number, postId: number, option: 'A' | 'B'): Promise<void> {
    const post = await this.postRepository.findOneByIdOrThrow(postId);
    if (post.type !== AZEYO_COMMUNITY_POST_TYPE.VOTE) throw new AzeyoCommunityNotVotePost();

    const existingVote = await this.voteRepository.findByPostIdAndUserId(postId, userId);
    if (existingVote) {
      if (existingVote.option === option) {
        await this.voteRepository.remove(existingVote);
      } else {
        existingVote.option = option;
        await this.voteRepository.save(existingVote);
      }
    } else {
      await this.voteRepository.save({ userId, postId, option });
    }
  }
}
