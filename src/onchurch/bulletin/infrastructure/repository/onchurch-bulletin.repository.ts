import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IOnchurchBulletinRepository,
  OnchurchBulletinWriteParams,
} from '@/onchurch/bulletin/domain/repository/onchurch-bulletin.repository.interface';
import { OnchurchBulletin } from '@/onchurch/bulletin/domain/entity/onchurch-bulletin.entity';

@Injectable()
export class OnchurchBulletinRepository implements IOnchurchBulletinRepository {
  constructor(
    @InjectRepository(OnchurchBulletin)
    private readonly bulletinRepository: Repository<OnchurchBulletin>,
  ) {}

  async findByChurchId(churchId: number): Promise<OnchurchBulletin | null> {
    return this.bulletinRepository.findOneBy({ churchId });
  }

  async upsertByChurchId(churchId: number, params: OnchurchBulletinWriteParams): Promise<OnchurchBulletin> {
    const existing = await this.bulletinRepository.findOneBy({ churchId });
    if (existing) {
      Object.assign(existing, params);
      return this.bulletinRepository.save(existing);
    }
    return this.bulletinRepository.save({ churchId, ...params });
  }
}
