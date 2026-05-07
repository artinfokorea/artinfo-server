import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IOnchurchHistoryRepository, OnchurchHistoryWriteParams } from '@/onchurch/about/domain/repository/onchurch-history.repository.interface';
import { OnchurchHistory } from '@/onchurch/about/domain/entity/onchurch-history.entity';
import { OnchurchHistoryNotFound } from '@/onchurch/about/domain/exception/onchurch-about.exception';

@Injectable()
export class OnchurchHistoryRepository implements IOnchurchHistoryRepository {
  constructor(
    @InjectRepository(OnchurchHistory)
    private readonly historyRepository: Repository<OnchurchHistory>,
  ) {}

  async findAllByChurchId(churchId: number): Promise<OnchurchHistory[]> {
    return this.historyRepository.find({
      where: { churchId },
      order: { sortOrder: 'ASC', year: 'ASC', id: 'ASC' },
    });
  }

  async findActiveByChurchId(churchId: number): Promise<OnchurchHistory[]> {
    return this.historyRepository.find({
      where: { churchId, isActive: true },
      order: { sortOrder: 'ASC', year: 'ASC', id: 'ASC' },
    });
  }

  async findOwnedById(churchId: number, id: number): Promise<OnchurchHistory | null> {
    return this.historyRepository.findOneBy({ id, churchId });
  }

  async create(churchId: number, params: OnchurchHistoryWriteParams): Promise<OnchurchHistory> {
    return this.historyRepository.save({ churchId, ...params });
  }

  async update(churchId: number, id: number, params: OnchurchHistoryWriteParams): Promise<OnchurchHistory> {
    const h = await this.historyRepository.findOneBy({ id, churchId });
    if (!h) throw new OnchurchHistoryNotFound();
    Object.assign(h, params);
    return this.historyRepository.save(h);
  }

  async remove(churchId: number, id: number): Promise<void> {
    const h = await this.historyRepository.findOneBy({ id, churchId });
    if (!h) throw new OnchurchHistoryNotFound();
    await this.historyRepository.softRemove(h);
  }
}
