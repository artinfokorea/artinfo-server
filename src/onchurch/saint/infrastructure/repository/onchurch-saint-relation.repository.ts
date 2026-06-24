import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IOnchurchSaintRelationRepository,
  OnchurchSaintRelationCreateParams,
} from '@/onchurch/saint/domain/repository/onchurch-saint-relation.repository.interface';
import { OnchurchSaintRelation } from '@/onchurch/saint/domain/entity/onchurch-saint-relation.entity';
import { OnchurchSaintRelationNotFound } from '@/onchurch/saint/domain/exception/onchurch-saint.exception';

@Injectable()
export class OnchurchSaintRelationRepository implements IOnchurchSaintRelationRepository {
  constructor(
    @InjectRepository(OnchurchSaintRelation)
    private readonly repo: Repository<OnchurchSaintRelation>,
  ) {}

  async findBySaintId(churchId: number, saintId: number): Promise<OnchurchSaintRelation[]> {
    return this.repo.find({
      where: { churchId, saintId },
      order: { id: 'ASC' },
    });
  }

  async findOwnedById(churchId: number, id: number): Promise<OnchurchSaintRelation | null> {
    return this.repo.findOneBy({ id, churchId });
  }

  async findPair(churchId: number, saintId: number, relatedSaintId: number): Promise<OnchurchSaintRelation | null> {
    return this.repo.findOneBy({ churchId, saintId, relatedSaintId });
  }

  async removeBySaintId(churchId: number, saintId: number): Promise<void> {
    // 해당 성도가 주체(saint_id)이거나 대상(related_saint_id)인 모든 관계를 함께 제거한다.
    const related = await this.repo.find({
      where: [
        { churchId, saintId },
        { churchId, relatedSaintId: saintId },
      ],
    });
    if (related.length) await this.repo.softRemove(related);
  }

  async create(churchId: number, params: OnchurchSaintRelationCreateParams): Promise<OnchurchSaintRelation> {
    return this.repo.save({ churchId, ...params });
  }

  async remove(churchId: number, id: number): Promise<void> {
    const v = await this.repo.findOneBy({ id, churchId });
    if (!v) throw new OnchurchSaintRelationNotFound();
    await this.repo.softRemove(v);
  }
}
