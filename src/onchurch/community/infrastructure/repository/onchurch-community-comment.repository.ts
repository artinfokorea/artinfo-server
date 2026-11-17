import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IOnchurchCommunityCommentRepository } from '@/onchurch/community/domain/repository/onchurch-community-comment.repository.interface';
import { OnchurchCommunityComment } from '@/onchurch/community/domain/entity/onchurch-community-comment.entity';

@Injectable()
export class OnchurchCommunityCommentRepository implements IOnchurchCommunityCommentRepository {
  constructor(
    @InjectRepository(OnchurchCommunityComment)
    private readonly commentRepository: Repository<OnchurchCommunityComment>,
  ) {}

  async findByPostId(churchId: number, postId: number): Promise<OnchurchCommunityComment[]> {
    return this.commentRepository.find({ where: { churchId, postId }, order: { createdAt: 'ASC', id: 'ASC' } });
  }

  async countByPostIds(churchId: number, postIds: number[]): Promise<Map<number, number>> {
    const result = new Map<number, number>();
    if (postIds.length === 0) return result;
    const rows = await this.commentRepository
      .createQueryBuilder('c')
      .select('c.post_id', 'postId')
      .addSelect('COUNT(*)', 'count')
      .where('c.church_id = :churchId', { churchId })
      .andWhere('c.post_id IN (:...postIds)', { postIds })
      .andWhere('c.deleted_at IS NULL')
      .groupBy('c.post_id')
      .getRawMany<{ postId: string; count: string }>();
    for (const r of rows) result.set(Number(r.postId), Number(r.count));
    return result;
  }

  async findById(churchId: number, id: number): Promise<OnchurchCommunityComment | null> {
    return this.commentRepository.findOneBy({ id, churchId });
  }

  async create(params: { churchId: number; postId: number; authorId: number; authorName: string; content: string }): Promise<OnchurchCommunityComment> {
    return this.commentRepository.save({ ...params });
  }

  async remove(comment: OnchurchCommunityComment): Promise<void> {
    await this.commentRepository.softRemove(comment);
  }
}
