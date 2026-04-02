import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { AzeyoScheduleTag } from '@/azeyo/schedule/domain/entity/azeyo-schedule-tag.entity';
import { IAzeyoScheduleTagRepository } from '@/azeyo/schedule/domain/repository/azeyo-schedule-tag.repository.interface';

@Injectable()
export class AzeyoScheduleTagRepository implements IAzeyoScheduleTagRepository {
  constructor(
    @InjectRepository(AzeyoScheduleTag)
    private readonly repository: Repository<AzeyoScheduleTag>,
  ) {}

  async create(tag: Partial<AzeyoScheduleTag>): Promise<AzeyoScheduleTag> {
    const entity = this.repository.create(tag);
    return this.repository.save(entity);
  }

  async findByIds(ids: number[]): Promise<AzeyoScheduleTag[]> {
    if (ids.length === 0) return [];
    return this.repository.findBy({ id: In(ids) });
  }

  async findSystemAndUserTags(userId: number): Promise<AzeyoScheduleTag[]> {
    return this.repository.createQueryBuilder('tag')
      .where('tag.isSystem = true')
      .orWhere('tag.userId = :userId', { userId })
      .orderBy('tag.isSystem', 'DESC')
      .addOrderBy('tag.id', 'ASC')
      .getMany();
  }
}
