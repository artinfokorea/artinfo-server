import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IOnchurchCommunityCategoryRepository,
  OnchurchCommunityCategoryWriteParams,
} from '@/onchurch/community/domain/repository/onchurch-community-category.repository.interface';
import { OnchurchCommunityCategory } from '@/onchurch/community/domain/entity/onchurch-community-category.entity';
import { OnchurchCommunityCategoryNotFound } from '@/onchurch/community/domain/exception/onchurch-community.exception';

@Injectable()
export class OnchurchCommunityCategoryRepository implements IOnchurchCommunityCategoryRepository {
  constructor(
    @InjectRepository(OnchurchCommunityCategory)
    private readonly repo: Repository<OnchurchCommunityCategory>,
  ) {}

  async findAllByChurchId(churchId: number): Promise<OnchurchCommunityCategory[]> {
    return this.repo.find({ where: { churchId }, order: { sortOrder: 'ASC', id: 'ASC' } });
  }

  async findActiveByChurchId(churchId: number): Promise<OnchurchCommunityCategory[]> {
    return this.repo.find({ where: { churchId, isActive: true }, order: { sortOrder: 'ASC', id: 'ASC' } });
  }

  async findOwnedById(churchId: number, id: number): Promise<OnchurchCommunityCategory | null> {
    return this.repo.findOneBy({ id, churchId });
  }

  async create(churchId: number, params: OnchurchCommunityCategoryWriteParams): Promise<OnchurchCommunityCategory> {
    return this.repo.save({ churchId, ...params });
  }

  async update(churchId: number, id: number, params: OnchurchCommunityCategoryWriteParams): Promise<OnchurchCommunityCategory> {
    const v = await this.repo.findOneBy({ id, churchId });
    if (!v) throw new OnchurchCommunityCategoryNotFound();
    Object.assign(v, params);
    return this.repo.save(v);
  }

  async remove(churchId: number, id: number): Promise<void> {
    const v = await this.repo.findOneBy({ id, churchId });
    if (!v) throw new OnchurchCommunityCategoryNotFound();
    await this.repo.softRemove(v);
  }
}
