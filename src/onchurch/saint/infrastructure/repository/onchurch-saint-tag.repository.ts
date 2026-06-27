import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { IOnchurchSaintTagRepository } from '@/onchurch/saint/domain/repository/onchurch-saint-tag.repository.interface';
import { OnchurchSaintTag } from '@/onchurch/saint/domain/entity/onchurch-saint-tag.entity';
import { OnchurchSaintTagNotFound } from '@/onchurch/saint/domain/exception/onchurch-saint.exception';

@Injectable()
export class OnchurchSaintTagRepository implements IOnchurchSaintTagRepository {
  constructor(
    @InjectRepository(OnchurchSaintTag)
    private readonly repo: Repository<OnchurchSaintTag>,
  ) {}

  async findAllByChurchId(churchId: number): Promise<OnchurchSaintTag[]> {
    return this.repo.find({ where: { churchId }, order: { sortOrder: 'ASC', id: 'ASC' } });
  }

  async findOwnedById(churchId: number, id: number): Promise<OnchurchSaintTag | null> {
    return this.repo.findOneBy({ id, churchId });
  }

  async findByName(churchId: number, name: string): Promise<OnchurchSaintTag | null> {
    return this.repo.findOneBy({ churchId, name });
  }

  async findByIds(churchId: number, ids: number[]): Promise<OnchurchSaintTag[]> {
    if (ids.length === 0) return [];
    return this.repo.find({ where: { churchId, id: In(ids) } });
  }

  async countAllIncludingDeleted(churchId: number): Promise<number> {
    return this.repo.count({ where: { churchId }, withDeleted: true });
  }

  async create(churchId: number, name: string, sortOrder: number): Promise<OnchurchSaintTag> {
    return this.repo.save({ churchId, name, sortOrder });
  }

  async createMany(churchId: number, names: string[]): Promise<OnchurchSaintTag[]> {
    const rows = names.map((name, i) => this.repo.create({ churchId, name, sortOrder: i }));
    return this.repo.save(rows);
  }

  async remove(churchId: number, id: number): Promise<void> {
    const v = await this.repo.findOneBy({ id, churchId });
    if (!v) throw new OnchurchSaintTagNotFound();
    await this.repo.softRemove(v);
  }
}
