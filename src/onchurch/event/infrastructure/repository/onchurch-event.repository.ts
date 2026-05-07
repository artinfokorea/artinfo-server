import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IOnchurchEventRepository, OnchurchEventWriteParams } from '@/onchurch/event/domain/repository/onchurch-event.repository.interface';
import { OnchurchEvent } from '@/onchurch/event/domain/entity/onchurch-event.entity';
import { OnchurchEventNotFound } from '@/onchurch/event/domain/exception/onchurch-event.exception';

@Injectable()
export class OnchurchEventRepository implements IOnchurchEventRepository {
  constructor(
    @InjectRepository(OnchurchEvent)
    private readonly eventRepository: Repository<OnchurchEvent>,
  ) {}

  async findAllByChurchId(churchId: number): Promise<OnchurchEvent[]> {
    return this.eventRepository.find({
      where: { churchId },
      order: { startAt: 'ASC' },
    });
  }

  async findActiveByChurchIdInRange(churchId: number, from: Date | null, to: Date | null): Promise<OnchurchEvent[]> {
    const qb = this.eventRepository
      .createQueryBuilder('e')
      .where('e.churchId = :churchId', { churchId })
      .andWhere('e.isActive = true')
      .orderBy('e.startAt', 'ASC');

    if (from) qb.andWhere('e.startAt >= :from', { from });
    if (to) qb.andWhere('e.startAt < :to', { to });

    return qb.getMany();
  }

  async findOwnedById(churchId: number, id: number): Promise<OnchurchEvent | null> {
    return this.eventRepository.findOneBy({ id, churchId });
  }

  async create(churchId: number, params: OnchurchEventWriteParams): Promise<OnchurchEvent> {
    return this.eventRepository.save({ churchId, ...params });
  }

  async update(churchId: number, id: number, params: OnchurchEventWriteParams): Promise<OnchurchEvent> {
    const event = await this.eventRepository.findOneBy({ id, churchId });
    if (!event) throw new OnchurchEventNotFound();
    Object.assign(event, params);
    return this.eventRepository.save(event);
  }

  async remove(churchId: number, id: number): Promise<void> {
    const event = await this.eventRepository.findOneBy({ id, churchId });
    if (!event) throw new OnchurchEventNotFound();
    await this.eventRepository.softRemove(event);
  }
}
