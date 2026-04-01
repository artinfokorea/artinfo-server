import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { AzeyoCommunityVote } from '@/azeyo/community/domain/entity/azeyo-community-vote.entity';
import { IAzeyoCommunityVoteRepository } from '@/azeyo/community/domain/repository/azeyo-community-vote.repository.interface';

@Injectable()
export class AzeyoCommunityVoteRepository implements IAzeyoCommunityVoteRepository {
  constructor(
    @InjectRepository(AzeyoCommunityVote)
    private readonly repository: Repository<AzeyoCommunityVote>,
  ) {}

  async findByPostIdAndUserId(postId: number, userId: number): Promise<AzeyoCommunityVote | null> {
    return this.repository.findOneBy({ postId, userId });
  }

  async countByPostIdAndOption(postId: number, option: 'A' | 'B'): Promise<number> {
    return this.repository.countBy({ postId, option });
  }

  async save(vote: Partial<AzeyoCommunityVote>): Promise<AzeyoCommunityVote> {
    const entity = this.repository.create(vote);
    return this.repository.save(entity);
  }

  async remove(vote: AzeyoCommunityVote): Promise<void> {
    await this.repository.remove(vote);
  }

  async findUserVotesForPosts(postIds: number[], userId: number): Promise<AzeyoCommunityVote[]> {
    if (postIds.length === 0) return [];
    return this.repository.findBy({ postId: In(postIds), userId });
  }

  async countVotesForPosts(postIds: number[]): Promise<{ postId: number; option: string; count: number }[]> {
    if (postIds.length === 0) return [];
    return this.repository.createQueryBuilder('vote')
      .select('vote.post_id', 'postId')
      .addSelect('vote.option', 'option')
      .addSelect('COUNT(vote.id)', 'count')
      .where('vote.post_id IN (:...postIds)', { postIds })
      .groupBy('vote.post_id')
      .addGroupBy('vote.option')
      .getRawMany();
  }
}
