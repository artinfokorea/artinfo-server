import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  IOnchurchSaintRepository,
  OnchurchSaintWriteParams,
} from '@/onchurch/saint/domain/repository/onchurch-saint.repository.interface';
import { OnchurchSaint } from '@/onchurch/saint/domain/entity/onchurch-saint.entity';
import { OnchurchSaintNotFound } from '@/onchurch/saint/domain/exception/onchurch-saint.exception';

@Injectable()
export class OnchurchSaintRepository implements IOnchurchSaintRepository {
  constructor(
    @InjectRepository(OnchurchSaint)
    private readonly repo: Repository<OnchurchSaint>,
  ) {}

  async findAllByChurchId(churchId: number): Promise<OnchurchSaint[]> {
    return this.repo.find({
      where: { churchId },
      order: { name: 'ASC', id: 'ASC' },
    });
  }

  async findOwnedById(churchId: number, id: number): Promise<OnchurchSaint | null> {
    return this.repo.findOneBy({ id, churchId });
  }

  async findByIds(churchId: number, ids: number[]): Promise<OnchurchSaint[]> {
    if (ids.length === 0) return [];
    return this.repo.find({ where: { churchId, id: In(ids) } });
  }

  async create(churchId: number, params: OnchurchSaintWriteParams): Promise<OnchurchSaint> {
    return this.repo.save({ churchId, ...params });
  }

  async update(churchId: number, id: number, params: OnchurchSaintWriteParams): Promise<OnchurchSaint> {
    const v = await this.repo.findOneBy({ id, churchId });
    if (!v) throw new OnchurchSaintNotFound();
    Object.assign(v, params);
    return this.repo.save(v);
  }

  async updateMemo(churchId: number, id: number, memo: string | null): Promise<OnchurchSaint> {
    const v = await this.repo.findOneBy({ id, churchId });
    if (!v) throw new OnchurchSaintNotFound();
    v.memo = memo;
    return this.repo.save(v);
  }

  async updateFavorite(churchId: number, id: number, isFavorite: boolean): Promise<OnchurchSaint> {
    const v = await this.repo.findOneBy({ id, churchId });
    if (!v) throw new OnchurchSaintNotFound();
    v.isFavorite = isFavorite;
    return this.repo.save(v);
  }

  async remove(churchId: number, id: number): Promise<void> {
    const v = await this.repo.findOneBy({ id, churchId });
    if (!v) throw new OnchurchSaintNotFound();
    await this.repo.softRemove(v);
  }
}
