import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IOnchurchSermonRepository,
  OnchurchSermonWriteParams,
} from '@/onchurch/sermon/domain/repository/onchurch-sermon.repository.interface';
import { OnchurchSermon } from '@/onchurch/sermon/domain/entity/onchurch-sermon.entity';
import { OnchurchSermonNotFound } from '@/onchurch/sermon/domain/exception/onchurch-sermon.exception';

@Injectable()
export class OnchurchSermonRepository implements IOnchurchSermonRepository {
  constructor(
    @InjectRepository(OnchurchSermon)
    private readonly repo: Repository<OnchurchSermon>,
  ) {}

  async findAllByChurchId(churchId: number): Promise<OnchurchSermon[]> {
    return this.repo.find({ where: { churchId }, order: { sortOrder: 'ASC', id: 'ASC' } });
  }

  async findActiveByChurchId(churchId: number): Promise<OnchurchSermon[]> {
    return this.repo.find({ where: { churchId, isActive: true }, order: { sortOrder: 'ASC', id: 'ASC' } });
  }

  async findOwnedById(churchId: number, id: number): Promise<OnchurchSermon | null> {
    return this.repo.findOneBy({ id, churchId });
  }

  async create(churchId: number, params: OnchurchSermonWriteParams): Promise<OnchurchSermon> {
    return this.repo.save({ churchId, ...params });
  }

  async update(churchId: number, id: number, params: OnchurchSermonWriteParams): Promise<OnchurchSermon> {
    const v = await this.repo.findOneBy({ id, churchId });
    if (!v) throw new OnchurchSermonNotFound();
    Object.assign(v, params);
    return this.repo.save(v);
  }

  async remove(churchId: number, id: number): Promise<void> {
    const v = await this.repo.findOneBy({ id, churchId });
    if (!v) throw new OnchurchSermonNotFound();
    await this.repo.softRemove(v);
  }
}
