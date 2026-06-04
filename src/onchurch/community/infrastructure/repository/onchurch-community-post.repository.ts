import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IOnchurchCommunityPostRepository,
  OnchurchCommunityPostUpdateParams,
  OnchurchCommunityPostWriteParams,
} from '@/onchurch/community/domain/repository/onchurch-community-post.repository.interface';
import { OnchurchCommunityPost } from '@/onchurch/community/domain/entity/onchurch-community-post.entity';
import { OnchurchCommunityForbidden, OnchurchCommunityPostNotFound } from '@/onchurch/community/domain/exception/onchurch-community.exception';

@Injectable()
export class OnchurchCommunityPostRepository implements IOnchurchCommunityPostRepository {
  constructor(
    @InjectRepository(OnchurchCommunityPost)
    private readonly postRepository: Repository<OnchurchCommunityPost>,
  ) {}

  async findVisiblePagedByChurchId(
    churchId: number,
    params: { category?: string; skip: number; take: number },
  ): Promise<{ items: OnchurchCommunityPost[]; totalCount: number }> {
    const qb = this.postRepository
      .createQueryBuilder('p')
      .where('p.churchId = :churchId', { churchId })
      .andWhere('p.isHidden = false')
      .orderBy('p.createdAt', 'DESC')
      .addOrderBy('p.id', 'DESC')
      .skip(params.skip)
      .take(params.take);

    if (params.category && params.category !== '전체') {
      qb.andWhere('p.category = :category', { category: params.category });
    }

    const [items, totalCount] = await qb.getManyAndCount();
    return { items, totalCount };
  }

  async findVisibleById(churchId: number, id: number): Promise<OnchurchCommunityPost | null> {
    return this.postRepository.findOneBy({ id, churchId, isHidden: false });
  }

  async findAllByChurchId(churchId: number): Promise<OnchurchCommunityPost[]> {
    return this.postRepository.find({
      where: { churchId },
      order: { createdAt: 'DESC', id: 'DESC' },
    });
  }

  async findById(churchId: number, id: number): Promise<OnchurchCommunityPost | null> {
    return this.postRepository.findOneBy({ id, churchId });
  }

  async create(churchId: number, params: OnchurchCommunityPostWriteParams): Promise<OnchurchCommunityPost> {
    return this.postRepository.save({ churchId, ...params, isHidden: false, reportCount: 0 });
  }

  async updateOwn(
    churchId: number,
    id: number,
    authorId: number,
    params: OnchurchCommunityPostUpdateParams,
  ): Promise<OnchurchCommunityPost> {
    const post = await this.postRepository.findOneBy({ id, churchId });
    if (!post) throw new OnchurchCommunityPostNotFound();
    if (post.authorId !== authorId) throw new OnchurchCommunityForbidden();
    Object.assign(post, params);
    return this.postRepository.save(post);
  }

  async removeOwn(churchId: number, id: number, authorId: number): Promise<void> {
    const post = await this.postRepository.findOneBy({ id, churchId });
    if (!post) throw new OnchurchCommunityPostNotFound();
    if (post.authorId !== authorId) throw new OnchurchCommunityForbidden();
    await this.postRepository.softRemove(post);
  }

  async setHidden(churchId: number, id: number, isHidden: boolean): Promise<OnchurchCommunityPost> {
    const post = await this.postRepository.findOneBy({ id, churchId });
    if (!post) throw new OnchurchCommunityPostNotFound();
    post.isHidden = isHidden;
    return this.postRepository.save(post);
  }

  async removeByChurch(churchId: number, id: number): Promise<void> {
    const post = await this.postRepository.findOneBy({ id, churchId });
    if (!post) throw new OnchurchCommunityPostNotFound();
    await this.postRepository.softRemove(post);
  }

  async incrementReport(churchId: number, id: number): Promise<OnchurchCommunityPost> {
    const post = await this.postRepository.findOneBy({ id, churchId });
    if (!post) throw new OnchurchCommunityPostNotFound();
    post.reportCount = (post.reportCount ?? 0) + 1;
    return this.postRepository.save(post);
  }
}
