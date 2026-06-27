import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IOnchurchVisitationRepository,
  OnchurchVisitationWriteParams,
} from '@/onchurch/visitation/domain/repository/onchurch-visitation.repository.interface';
import { OnchurchVisitation } from '@/onchurch/visitation/domain/entity/onchurch-visitation.entity';
import { OnchurchVisitationNotFound } from '@/onchurch/visitation/domain/exception/onchurch-visitation.exception';

@Injectable()
export class OnchurchVisitationRepository implements IOnchurchVisitationRepository {
  constructor(
    @InjectRepository(OnchurchVisitation)
    private readonly repo: Repository<OnchurchVisitation>,
  ) {}

  async findAllByChurchId(churchId: number): Promise<OnchurchVisitation[]> {
    return this.repo.find({
      where: { churchId },
      order: { date: 'DESC', id: 'DESC' },
    });
  }

  async findOwnedById(churchId: number, id: number): Promise<OnchurchVisitation | null> {
    return this.repo.findOneBy({ id, churchId });
  }

  async create(churchId: number, params: OnchurchVisitationWriteParams): Promise<OnchurchVisitation> {
    return this.repo.save({ churchId, ...params });
  }

  async update(churchId: number, id: number, params: OnchurchVisitationWriteParams): Promise<OnchurchVisitation> {
    const v = await this.repo.findOneBy({ id, churchId });
    if (!v) throw new OnchurchVisitationNotFound();
    Object.assign(v, params);
    return this.repo.save(v);
  }

  async remove(churchId: number, id: number): Promise<void> {
    const v = await this.repo.findOneBy({ id, churchId });
    if (!v) throw new OnchurchVisitationNotFound();
    await this.repo.softRemove(v);
  }
}
