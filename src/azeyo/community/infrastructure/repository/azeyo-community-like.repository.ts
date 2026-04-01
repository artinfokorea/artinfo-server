import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { AzeyoCommunityLike } from '@/azeyo/community/domain/entity/azeyo-community-like.entity';
import { IAzeyoCommunityLikeRepository } from '@/azeyo/community/domain/repository/azeyo-community-like.repository.interface';

@Injectable()
export class AzeyoCommunityLikeRepository implements IAzeyoCommunityLikeRepository {
  constructor(
    @InjectRepository(AzeyoCommunityLike)
    private readonly repository: Repository<AzeyoCommunityLike>,
  ) {}

  async findByTargetIdAndUserId(targetId: number, userId: number): Promise<AzeyoCommunityLike | null> {
    return this.repository.findOneBy({ targetId, userId });
  }

  async save(like: Partial<AzeyoCommunityLike>): Promise<AzeyoCommunityLike> {
    const entity = this.repository.create(like);
    return this.repository.save(entity);
  }

  async softRemove(like: AzeyoCommunityLike): Promise<void> {
    await this.repository.softRemove(like);
  }

  async findManyByTargetIdsAndUserId(targetIds: number[], userId: number): Promise<AzeyoCommunityLike[]> {
    if (targetIds.length === 0) return [];
    return this.repository.findBy({ targetId: In(targetIds), userId });
  }

  async countByTargetIds(targetIds: number[]): Promise<{ targetId: number; count: number }[]> {
    if (targetIds.length === 0) return [];
    return this.repository.createQueryBuilder('like')
      .select('like.target_id', 'targetId')
      .addSelect('COUNT(like.id)', 'count')
      .where('like.target_id IN (:...targetIds)', { targetIds })
      .groupBy('like.target_id')
      .getRawMany();
  }
}
