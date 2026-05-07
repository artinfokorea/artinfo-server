import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IOnchurchPastorRepository, OnchurchPastorWriteParams } from '@/onchurch/about/domain/repository/onchurch-pastor.repository.interface';
import { OnchurchPastor } from '@/onchurch/about/domain/entity/onchurch-pastor.entity';

@Injectable()
export class OnchurchPastorRepository implements IOnchurchPastorRepository {
  constructor(
    @InjectRepository(OnchurchPastor)
    private readonly pastorRepository: Repository<OnchurchPastor>,
  ) {}

  async findByChurchId(churchId: number): Promise<OnchurchPastor | null> {
    return this.pastorRepository.findOneBy({ churchId });
  }

  async upsertByChurchId(churchId: number, params: OnchurchPastorWriteParams): Promise<OnchurchPastor> {
    const existing = await this.pastorRepository.findOneBy({ churchId });
    if (existing) {
      Object.assign(existing, params);
      return this.pastorRepository.save(existing);
    }
    return this.pastorRepository.save({ churchId, ...params });
  }
}
