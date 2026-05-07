import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IOnchurchTransportationRepository,
  OnchurchTransportationWriteParams,
} from '@/onchurch/transportation/domain/repository/onchurch-transportation.repository.interface';
import { OnchurchTransportation } from '@/onchurch/transportation/domain/entity/onchurch-transportation.entity';
import { OnchurchTransportationNotFound } from '@/onchurch/transportation/domain/exception/onchurch-transportation.exception';

@Injectable()
export class OnchurchTransportationRepository implements IOnchurchTransportationRepository {
  constructor(
    @InjectRepository(OnchurchTransportation)
    private readonly repo: Repository<OnchurchTransportation>,
  ) {}

  async findActiveByChurchId(churchId: number): Promise<OnchurchTransportation[]> {
    return this.repo.find({
      where: { churchId, isActive: true },
      order: { sortOrder: 'ASC', id: 'ASC' },
    });
  }

  async findAllByChurchId(churchId: number): Promise<OnchurchTransportation[]> {
    return this.repo.find({
      where: { churchId },
      order: { sortOrder: 'ASC', id: 'ASC' },
    });
  }

  async findOwnedById(churchId: number, id: number): Promise<OnchurchTransportation | null> {
    return this.repo.findOneBy({ id, churchId });
  }

  async create(churchId: number, params: OnchurchTransportationWriteParams): Promise<OnchurchTransportation> {
    return this.repo.save({
      churchId,
      icon: params.icon,
      tag: params.tag,
      title: params.title,
      description: params.description,
      sortOrder: params.sortOrder,
      isActive: params.isActive,
    });
  }

  async update(churchId: number, id: number, params: OnchurchTransportationWriteParams): Promise<OnchurchTransportation> {
    const entity = await this.repo.findOneBy({ id, churchId });
    if (!entity) throw new OnchurchTransportationNotFound();
    Object.assign(entity, params);
    return this.repo.save(entity);
  }

  async remove(churchId: number, id: number): Promise<void> {
    const entity = await this.repo.findOneBy({ id, churchId });
    if (!entity) throw new OnchurchTransportationNotFound();
    await this.repo.softRemove(entity);
  }
}
