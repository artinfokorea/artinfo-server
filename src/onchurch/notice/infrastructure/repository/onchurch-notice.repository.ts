import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IOnchurchNoticeRepository, OnchurchNoticeWriteParams } from '@/onchurch/notice/domain/repository/onchurch-notice.repository.interface';
import { OnchurchNotice } from '@/onchurch/notice/domain/entity/onchurch-notice.entity';
import { OnchurchNoticeNotFound } from '@/onchurch/notice/domain/exception/onchurch-notice.exception';

@Injectable()
export class OnchurchNoticeRepository implements IOnchurchNoticeRepository {
  constructor(
    @InjectRepository(OnchurchNotice)
    private readonly noticeRepository: Repository<OnchurchNotice>,
  ) {}

  async findAllByChurchId(churchId: number): Promise<OnchurchNotice[]> {
    return this.noticeRepository.find({
      where: { churchId },
      order: { isPinned: 'DESC', publishedAt: 'DESC', createdAt: 'DESC' },
    });
  }

  async findActivePagedByChurchId(
    churchId: number,
    params: { category?: string; keyword?: string; skip: number; take: number },
  ): Promise<{ items: OnchurchNotice[]; totalCount: number }> {
    const qb = this.noticeRepository
      .createQueryBuilder('n')
      .where('n.churchId = :churchId', { churchId })
      .andWhere('n.isActive = true')
      .orderBy('n.isPinned', 'DESC')
      .addOrderBy('COALESCE(n.publishedAt, n.createdAt)', 'DESC')
      .skip(params.skip)
      .take(params.take);

    if (params.category && params.category !== '전체') {
      qb.andWhere('n.category = :category', { category: params.category });
    }

    const keyword = params.keyword?.trim();
    if (keyword) {
      qb.andWhere('(n.title LIKE :kw OR n.content LIKE :kw OR n.author LIKE :kw)', { kw: `%${keyword}%` });
    }

    const [items, totalCount] = await qb.getManyAndCount();
    return { items, totalCount };
  }

  async findOwnedById(churchId: number, id: number): Promise<OnchurchNotice | null> {
    return this.noticeRepository.findOneBy({ id, churchId });
  }

  async create(churchId: number, params: OnchurchNoticeWriteParams): Promise<OnchurchNotice> {
    const seqNo = await this.nextSeqNo(churchId);
    return this.noticeRepository.save({ churchId, seqNo, ...params });
  }

  // 해당 교회의 가장 높은 순번 + 1. (삭제된 글까지 포함해 순번을 재사용하지 않는다)
  private async nextSeqNo(churchId: number): Promise<number> {
    const row = await this.noticeRepository
      .createQueryBuilder('n')
      .select('MAX(n.seqNo)', 'max')
      .where('n.churchId = :churchId', { churchId })
      .withDeleted()
      .getRawOne<{ max: string | null }>();
    return (row?.max ? Number(row.max) : 0) + 1;
  }

  async update(churchId: number, id: number, params: OnchurchNoticeWriteParams): Promise<OnchurchNotice> {
    const notice = await this.noticeRepository.findOneBy({ id, churchId });
    if (!notice) throw new OnchurchNoticeNotFound();
    Object.assign(notice, params);
    return this.noticeRepository.save(notice);
  }

  async remove(churchId: number, id: number): Promise<void> {
    const notice = await this.noticeRepository.findOneBy({ id, churchId });
    if (!notice) throw new OnchurchNoticeNotFound();
    await this.noticeRepository.softRemove(notice);
  }
}
