import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IOnchurchWorshipOrderRepository,
  OnchurchWorshipOrderWriteParams,
} from '@/onchurch/worship/domain/repository/onchurch-worship-order.repository.interface';
import { OnchurchWorshipOrder } from '@/onchurch/worship/domain/entity/onchurch-worship-order.entity';
import { OnchurchWorshipOrderNotFound } from '@/onchurch/worship/domain/exception/onchurch-worship.exception';

@Injectable()
export class OnchurchWorshipOrderRepository implements IOnchurchWorshipOrderRepository {
  constructor(
    @InjectRepository(OnchurchWorshipOrder)
    private readonly repo: Repository<OnchurchWorshipOrder>,
  ) {}

  async findAllByChurchId(churchId: number): Promise<OnchurchWorshipOrder[]> {
    return this.repo.find({
      where: { churchId },
      order: { sortOrder: 'ASC', id: 'ASC' },
    });
  }

  async findActiveByChurchId(churchId: number): Promise<OnchurchWorshipOrder[]> {
    return this.repo.find({
      where: { churchId, isActive: true },
      order: { sortOrder: 'ASC', id: 'ASC' },
    });
  }

  async findOwnedById(churchId: number, id: number): Promise<OnchurchWorshipOrder | null> {
    return this.repo.findOneBy({ id, churchId });
  }

  async create(churchId: number, params: OnchurchWorshipOrderWriteParams): Promise<OnchurchWorshipOrder> {
    return this.repo.save({ churchId, ...params });
  }

  async update(churchId: number, id: number, params: OnchurchWorshipOrderWriteParams): Promise<OnchurchWorshipOrder> {
    const v = await this.repo.findOneBy({ id, churchId });
    if (!v) throw new OnchurchWorshipOrderNotFound();
    Object.assign(v, params);
    return this.repo.save(v);
  }

  async remove(churchId: number, id: number): Promise<void> {
    const v = await this.repo.findOneBy({ id, churchId });
    if (!v) throw new OnchurchWorshipOrderNotFound();
    await this.repo.softRemove(v);
  }
}
