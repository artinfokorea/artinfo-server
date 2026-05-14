import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IOnchurchNoticeCategoryRepository,
  OnchurchNoticeCategoryWriteParams,
} from '@/onchurch/notice/domain/repository/onchurch-notice-category.repository.interface';
import { OnchurchNoticeCategory } from '@/onchurch/notice/domain/entity/onchurch-notice-category.entity';
import { OnchurchNoticeCategoryNotFound } from '@/onchurch/notice/domain/exception/onchurch-notice.exception';

@Injectable()
export class OnchurchNoticeCategoryRepository implements IOnchurchNoticeCategoryRepository {
  constructor(
    @InjectRepository(OnchurchNoticeCategory)
    private readonly repo: Repository<OnchurchNoticeCategory>,
  ) {}

  async findAllByChurchId(churchId: number): Promise<OnchurchNoticeCategory[]> {
    return this.repo.find({ where: { churchId }, order: { createdAt: 'DESC', id: 'DESC' } });
  }

  async findActiveByChurchId(churchId: number): Promise<OnchurchNoticeCategory[]> {
    return this.repo.find({ where: { churchId, isActive: true }, order: { createdAt: 'DESC', id: 'DESC' } });
  }

  async findOwnedById(churchId: number, id: number): Promise<OnchurchNoticeCategory | null> {
    return this.repo.findOneBy({ id, churchId });
  }

  async create(churchId: number, params: OnchurchNoticeCategoryWriteParams): Promise<OnchurchNoticeCategory> {
    return this.repo.save({ churchId, ...params });
  }

  async update(churchId: number, id: number, params: OnchurchNoticeCategoryWriteParams): Promise<OnchurchNoticeCategory> {
    const v = await this.repo.findOneBy({ id, churchId });
    if (!v) throw new OnchurchNoticeCategoryNotFound();
    Object.assign(v, params);
    return this.repo.save(v);
  }

  async remove(churchId: number, id: number): Promise<void> {
    const v = await this.repo.findOneBy({ id, churchId });
    if (!v) throw new OnchurchNoticeCategoryNotFound();
    await this.repo.softRemove(v);
  }
}
