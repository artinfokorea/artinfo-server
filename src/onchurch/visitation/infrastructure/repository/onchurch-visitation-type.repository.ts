import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IOnchurchVisitationTypeRepository } from '@/onchurch/visitation/domain/repository/onchurch-visitation-type.repository.interface';
import { OnchurchVisitationType } from '@/onchurch/visitation/domain/entity/onchurch-visitation-type.entity';
import { OnchurchVisitationTypeNotFound } from '@/onchurch/visitation/domain/exception/onchurch-visitation.exception';

@Injectable()
export class OnchurchVisitationTypeRepository implements IOnchurchVisitationTypeRepository {
  constructor(
    @InjectRepository(OnchurchVisitationType)
    private readonly repo: Repository<OnchurchVisitationType>,
  ) {}

  async findAllByChurchId(churchId: number): Promise<OnchurchVisitationType[]> {
    return this.repo.find({
      where: { churchId },
      order: { sortOrder: 'ASC', id: 'ASC' },
    });
  }

  async findOwnedById(churchId: number, id: number): Promise<OnchurchVisitationType | null> {
    return this.repo.findOneBy({ id, churchId });
  }

  async findByName(churchId: number, name: string): Promise<OnchurchVisitationType | null> {
    return this.repo.findOneBy({ churchId, name });
  }

  async countAllIncludingDeleted(churchId: number): Promise<number> {
    return this.repo.count({ where: { churchId }, withDeleted: true });
  }

  async create(churchId: number, name: string, sortOrder: number): Promise<OnchurchVisitationType> {
    return this.repo.save({ churchId, name, sortOrder });
  }

  async createMany(churchId: number, names: string[]): Promise<OnchurchVisitationType[]> {
    const rows = names.map((name, i) => this.repo.create({ churchId, name, sortOrder: i }));
    return this.repo.save(rows);
  }

  async remove(churchId: number, id: number): Promise<void> {
    const v = await this.repo.findOneBy({ id, churchId });
    if (!v) throw new OnchurchVisitationTypeNotFound();
    await this.repo.softRemove(v);
  }
}
