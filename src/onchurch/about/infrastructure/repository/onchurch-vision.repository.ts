import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IOnchurchVisionRepository, OnchurchVisionWriteParams } from '@/onchurch/about/domain/repository/onchurch-vision.repository.interface';
import { OnchurchVision } from '@/onchurch/about/domain/entity/onchurch-vision.entity';
import { OnchurchVisionNotFound } from '@/onchurch/about/domain/exception/onchurch-about.exception';

@Injectable()
export class OnchurchVisionRepository implements IOnchurchVisionRepository {
  constructor(
    @InjectRepository(OnchurchVision)
    private readonly visionRepository: Repository<OnchurchVision>,
  ) {}

  async findAllByChurchId(churchId: number): Promise<OnchurchVision[]> {
    return this.visionRepository.find({
      where: { churchId },
      order: { sortOrder: 'ASC', id: 'ASC' },
    });
  }

  async findActiveByChurchId(churchId: number): Promise<OnchurchVision[]> {
    return this.visionRepository.find({
      where: { churchId, isActive: true },
      order: { sortOrder: 'ASC', id: 'ASC' },
    });
  }

  async findOwnedById(churchId: number, id: number): Promise<OnchurchVision | null> {
    return this.visionRepository.findOneBy({ id, churchId });
  }

  async create(churchId: number, params: OnchurchVisionWriteParams): Promise<OnchurchVision> {
    return this.visionRepository.save({ churchId, ...params });
  }

  async update(churchId: number, id: number, params: OnchurchVisionWriteParams): Promise<OnchurchVision> {
    const v = await this.visionRepository.findOneBy({ id, churchId });
    if (!v) throw new OnchurchVisionNotFound();
    Object.assign(v, params);
    return this.visionRepository.save(v);
  }

  async remove(churchId: number, id: number): Promise<void> {
    const v = await this.visionRepository.findOneBy({ id, churchId });
    if (!v) throw new OnchurchVisionNotFound();
    await this.visionRepository.softRemove(v);
  }
}
