import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { AzeyoCommunityPost, AZEYO_COMMUNITY_CATEGORY } from '@/azeyo/community/domain/entity/azeyo-community-post.entity';
import { IAzeyoCommunityPostRepository } from '@/azeyo/community/domain/repository/azeyo-community-post.repository.interface';
import { AzeyoCommunityPostNotFound } from '@/azeyo/community/domain/exception/azeyo-community.exception';

@Injectable()
export class AzeyoCommunityPostRepository implements IAzeyoCommunityPostRepository {
  constructor(
    @InjectRepository(AzeyoCommunityPost)
    private readonly repository: Repository<AzeyoCommunityPost>,
  ) {}

  async create(post: Partial<AzeyoCommunityPost>): Promise<AzeyoCommunityPost> {
    const entity = this.repository.create(post);
    return this.repository.save(entity);
  }

  async findOneByIdOrThrow(id: number): Promise<AzeyoCommunityPost> {
    const post = await this.repository.findOneBy({ id });
    if (!post) throw new AzeyoCommunityPostNotFound();
    return post;
  }

  async findOneByIdWithUserOrThrow(id: number): Promise<AzeyoCommunityPost> {
    const post = await this.repository.createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .where('post.id = :id', { id })
      .getOne();
    if (!post) throw new AzeyoCommunityPostNotFound();
    return post;
  }

  async findOneByIdAndUserIdOrThrow(id: number, userId: number): Promise<AzeyoCommunityPost> {
    const post = await this.repository.findOneBy({ id, userId });
    if (!post) throw new AzeyoCommunityPostNotFound();
    return post;
  }

  async findManyPaging(params: {
    skip: number;
    take: number;
    category: AZEYO_COMMUNITY_CATEGORY | null;
    keyword: string | null;
  }): Promise<{ items: AzeyoCommunityPost[]; totalCount: number }> {
    const qb = this.repository.createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user');

    if (params.category) {
      qb.where('post.category = :category', { category: params.category });
    }

    if (params.keyword) {
      qb.andWhere(
        new Brackets(sub => {
          sub.where('LOWER(post.title) LIKE LOWER(:keyword)', { keyword: `%${params.keyword}%` })
            .orWhere('LOWER(post.contents) LIKE LOWER(:keyword)', { keyword: `%${params.keyword}%` });
        }),
      );
    }

    const [items, totalCount] = await qb
      .orderBy('post.createdAt', 'DESC')
      .skip(params.skip)
      .take(params.take)
      .getManyAndCount();

    return { items, totalCount };
  }

  async findTop(): Promise<AzeyoCommunityPost[]> {
    const startDate = new Date();
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(0);
    endDate.setHours(23, 59, 59, 999);

    return this.repository.createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .leftJoin('azeyo_community_likes', 'likes', 'likes.target_id = post.id AND likes.deleted_at IS NULL')
      .addSelect('COUNT(DISTINCT likes.id)', 'likesCount')
      .where('post.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('post.id')
      .addGroupBy('user.id')
      .orderBy('COUNT(DISTINCT likes.id)', 'DESC')
      .addOrderBy('post.createdAt', 'DESC')
      .limit(10)
      .getRawAndEntities()
      .then(({ entities, raw }) => {
        return entities.map((entity, index) => {
          entity.likesCount = Number(raw[index]?.likesCount ?? 0);
          return entity;
        });
      });
  }

  async incrementViewCount(id: number): Promise<void> {
    await this.repository.increment({ id }, 'viewCount', 1);
  }

  async softRemove(post: AzeyoCommunityPost): Promise<void> {
    await this.repository.softRemove(post);
  }

  async saveEntity(post: AzeyoCommunityPost): Promise<void> {
    await this.repository.save(post);
  }
}
