import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IOnchurchWorshipServiceRepository,
  OnchurchWorshipServiceWriteParams,
} from '@/onchurch/worship/domain/repository/onchurch-worship-service.repository.interface';
import { OnchurchWorshipService } from '@/onchurch/worship/domain/entity/onchurch-worship-service.entity';
import { OnchurchWorshipServiceNotFound } from '@/onchurch/worship/domain/exception/onchurch-worship.exception';

@Injectable()
export class OnchurchWorshipServiceRepository implements IOnchurchWorshipServiceRepository {
  constructor(
    @InjectRepository(OnchurchWorshipService)
    private readonly repo: Repository<OnchurchWorshipService>,
  ) {}

  async findAllByChurchId(churchId: number): Promise<OnchurchWorshipService[]> {
    return this.repo.find({
      where: { churchId },
      order: { sortOrder: 'ASC', id: 'ASC' },
    });
  }

  async findActiveByChurchId(churchId: number): Promise<OnchurchWorshipService[]> {
    return this.repo.find({
      where: { churchId, isActive: true },
      order: { sortOrder: 'ASC', id: 'ASC' },
    });
  }

  async findOwnedById(churchId: number, id: number): Promise<OnchurchWorshipService | null> {
    return this.repo.findOneBy({ id, churchId });
  }

  async create(churchId: number, params: OnchurchWorshipServiceWriteParams): Promise<OnchurchWorshipService> {
    return this.repo.save({ churchId, ...params });
  }

  async update(churchId: number, id: number, params: OnchurchWorshipServiceWriteParams): Promise<OnchurchWorshipService> {
    const v = await this.repo.findOneBy({ id, churchId });
    if (!v) throw new OnchurchWorshipServiceNotFound();
    Object.assign(v, params);
    return this.repo.save(v);
  }

  async remove(churchId: number, id: number): Promise<void> {
    const v = await this.repo.findOneBy({ id, churchId });
    if (!v) throw new OnchurchWorshipServiceNotFound();
    await this.repo.softRemove(v);
  }
}
