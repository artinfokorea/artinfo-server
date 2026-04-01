import { AzeyoCommunityVote } from '@/azeyo/community/domain/entity/azeyo-community-vote.entity';

export const AZEYO_COMMUNITY_VOTE_REPOSITORY = Symbol('AZEYO_COMMUNITY_VOTE_REPOSITORY');

export interface IAzeyoCommunityVoteRepository {
  findByPostIdAndUserId(postId: number, userId: number): Promise<AzeyoCommunityVote | null>;
  countByPostIdAndOption(postId: number, option: 'A' | 'B'): Promise<number>;
  save(vote: Partial<AzeyoCommunityVote>): Promise<AzeyoCommunityVote>;
  remove(vote: AzeyoCommunityVote): Promise<void>;
  findUserVotesForPosts(postIds: number[], userId: number): Promise<AzeyoCommunityVote[]>;
  countVotesForPosts(postIds: number[]): Promise<{ postId: number; option: string; count: number }[]>;
}
