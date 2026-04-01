import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AzeyoCommunityComment } from '@/azeyo/community/domain/entity/azeyo-community-comment.entity';
import { IAzeyoCommunityCommentRepository } from '@/azeyo/community/domain/repository/azeyo-community-comment.repository.interface';
import { AzeyoCommunityCommentNotFound } from '@/azeyo/community/domain/exception/azeyo-community.exception';

@Injectable()
export class AzeyoCommunityCommentRepository implements IAzeyoCommunityCommentRepository {
  constructor(
    @InjectRepository(AzeyoCommunityComment)
    private readonly repository: Repository<AzeyoCommunityComment>,
  ) {}

  async create(comment: Partial<AzeyoCommunityComment>): Promise<AzeyoCommunityComment> {
    const entity = this.repository.create(comment);
    return this.repository.save(entity);
  }

  async findOneByIdAndUserIdOrThrow(id: number, userId: number): Promise<AzeyoCommunityComment> {
    const comment = await this.repository.findOne({ where: { id, userId }, relations: ['user'] });
    if (!comment) throw new AzeyoCommunityCommentNotFound();
    return comment;
  }

  async findByPostId(postId: number, params: { parentId: number | null; skip: number; take: number }): Promise<{ items: AzeyoCommunityComment[]; totalCount: number }> {
    const qb = this.repository.createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .where('comment.postId = :postId', { postId });

    if (params.parentId !== null) {
      qb.andWhere('comment.parentId = :parentId', { parentId: params.parentId });
      qb.orderBy('comment.createdAt', 'ASC');
    } else {
      qb.andWhere('comment.parentId IS NULL');
      qb.orderBy('comment.createdAt', 'DESC');
    }

    // Add children count subquery for parent comments
    if (params.parentId === null) {
      qb.addSelect(sub =>
        sub.select('COUNT(child.id)')
          .from(AzeyoCommunityComment, 'child')
          .where('child.parentId = comment.id'),
        'childrenCount',
      );
    }

    const [items, totalCount] = await qb
      .skip(params.skip)
      .take(params.take)
      .getManyAndCount();

    // For parent comments, set childrenCount from raw query
    if (params.parentId === null) {
      const rawResults = await qb.getRawMany();
      items.forEach((item, index) => {
        item.childrenCount = Number(rawResults[index]?.childrenCount ?? 0);
      });
    }

    return { items, totalCount };
  }

  async editContents(id: number, userId: number, contents: string): Promise<void> {
    const comment = await this.findOneByIdAndUserIdOrThrow(id, userId);
    comment.contents = contents;
    await this.repository.save(comment);
  }

  async deleteWithChildren(id: number, userId: number): Promise<void> {
    await this.findOneByIdAndUserIdOrThrow(id, userId);
    await this.repository.createQueryBuilder()
      .softDelete()
      .where('id = :id OR parentId = :id', { id })
      .execute();
  }

  async countByPostIds(postIds: number[]): Promise<{ postId: number; count: number }[]> {
    if (postIds.length === 0) return [];
    return this.repository.createQueryBuilder('comment')
      .select('comment.post_id', 'postId')
      .addSelect('COUNT(comment.id)', 'count')
      .where('comment.post_id IN (:...postIds)', { postIds })
      .groupBy('comment.post_id')
      .getRawMany();
  }
}
