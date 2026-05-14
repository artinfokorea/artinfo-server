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

  async findAllByChurchId(churchId: number): Promise<OnchurchSermonSeries[]> {
    return this.repo.find({ where: { churchId }, order: { createdAt: 'DESC', id: 'DESC' } });
  }

  async findActiveByChurchId(churchId: number): Promise<OnchurchSermonSeries[]> {
    return this.repo.find({ where: { churchId, isActive: true }, order: { createdAt: 'DESC', id: 'DESC' } });
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
