import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IOnchurchPrayerRepository,
  OnchurchPrayerCreateParams,
} from '@/onchurch/prayer/domain/repository/onchurch-prayer.repository.interface';
import { OnchurchPrayerRequest, OnchurchPrayerStatus } from '@/onchurch/prayer/domain/entity/onchurch-prayer-request.entity';
import { OnchurchPrayerNotFound } from '@/onchurch/prayer/domain/exception/onchurch-prayer.exception';

@Injectable()
export class OnchurchPrayerRepository implements IOnchurchPrayerRepository {
  constructor(
    @InjectRepository(OnchurchPrayerRequest)
    private readonly prayerRepository: Repository<OnchurchPrayerRequest>,
  ) {}

  async create(churchId: number, params: OnchurchPrayerCreateParams): Promise<OnchurchPrayerRequest> {
    return this.prayerRepository.save({ churchId, status: 'pending' as OnchurchPrayerStatus, ...params });
  }

  async findAllByChurchId(churchId: number): Promise<OnchurchPrayerRequest[]> {
    return this.prayerRepository.find({
      where: { churchId },
      order: { createdAt: 'DESC', id: 'DESC' },
    });
  }

  async findOwnedById(churchId: number, id: number): Promise<OnchurchPrayerRequest | null> {
    return this.prayerRepository.findOneBy({ id, churchId });
  }

  async updateStatus(churchId: number, id: number, status: OnchurchPrayerStatus): Promise<OnchurchPrayerRequest> {
    const item = await this.prayerRepository.findOneBy({ id, churchId });
    if (!item) throw new OnchurchPrayerNotFound();
    item.status = status;
    return this.prayerRepository.save(item);
  }

  async remove(churchId: number, id: number): Promise<void> {
    const item = await this.prayerRepository.findOneBy({ id, churchId });
    if (!item) throw new OnchurchPrayerNotFound();
    await this.prayerRepository.softRemove(item);
  }
}
