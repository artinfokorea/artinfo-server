import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IOnchurchSermonSeriesRepository,
  OnchurchSermonSeriesWriteParams,
} from '@/onchurch/sermon/domain/repository/onchurch-sermon-series.repository.interface';
import { OnchurchSermonSeries } from '@/onchurch/sermon/domain/entity/onchurch-sermon-series.entity';
import { OnchurchSermonSeriesNotFound } from '@/onchurch/sermon/domain/exception/onchurch-sermon.exception';

@Injectable()
export class OnchurchSermonSeriesRepository implements IOnchurchSermonSeriesRepository {
  constructor(
    @InjectRepository(OnchurchSermonSeries)
    private readonly repo: Repository<OnchurchSermonSeries>,
  ) {}

  // '전체' 보기 카테고리를 한 번이라도 만든 적 있으면(삭제 포함) 다시 만들지 않는다.
  async ensureAllCategory(churchId: number): Promise<void> {
    const existing = await this.repo.findOne({ where: { churchId, isAll: true }, withDeleted: true });
    if (existing) return;
    await this.repo.save({ churchId, name: '전체', sortOrder: 0, isActive: true, isAll: true });
  }

  // 관리자가 명시적으로 '전체' 보기를 다시 켜는 경우: 삭제했던 것을 복구하거나 없으면 새로 만든다.
  async restoreAllCategory(churchId: number): Promise<void> {
    const existing = await this.repo.findOne({ where: { churchId, isAll: true }, withDeleted: true });
    if (existing) {
      if (existing.deletedAt) await this.repo.recover(existing);
      return;
    }
    await this.repo.save({ churchId, name: '전체', sortOrder: 0, isActive: true, isAll: true });
  }

  async findAllByChurchId(churchId: number): Promise<OnchurchSermonSeries[]> {
    return this.repo.find({ where: { churchId }, order: { isAll: 'DESC', createdAt: 'DESC', id: 'DESC' } });
  }

  async findActiveByChurchId(churchId: number): Promise<OnchurchSermonSeries[]> {
    return this.repo.find({ where: { churchId, isActive: true }, order: { isAll: 'DESC', createdAt: 'DESC', id: 'DESC' } });
  }

  async findOwnedById(churchId: number, id: number): Promise<OnchurchSermonSeries | null> {
    return this.repo.findOneBy({ id, churchId });
  }

  async create(churchId: number, params: OnchurchSermonSeriesWriteParams): Promise<OnchurchSermonSeries> {
    return this.repo.save({ churchId, ...params });
  }

  async update(churchId: number, id: number, params: OnchurchSermonSeriesWriteParams): Promise<OnchurchSermonSeries> {
    const v = await this.repo.findOneBy({ id, churchId });
    if (!v) throw new OnchurchSermonSeriesNotFound();
    Object.assign(v, params);
    return this.repo.save(v);
  }

  async remove(churchId: number, id: number): Promise<void> {
    const v = await this.repo.findOneBy({ id, churchId });
    if (!v) throw new OnchurchSermonSeriesNotFound();
    await this.repo.softRemove(v);
  }
}
