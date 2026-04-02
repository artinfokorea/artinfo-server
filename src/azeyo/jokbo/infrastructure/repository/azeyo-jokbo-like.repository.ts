import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { AzeyoJokboLike } from '@/azeyo/jokbo/domain/entity/azeyo-jokbo-like.entity';
import { IAzeyoJokboLikeRepository } from '@/azeyo/jokbo/domain/repository/azeyo-jokbo-like.repository.interface';

@Injectable()
export class AzeyoJokboLikeRepository implements IAzeyoJokboLikeRepository {
  constructor(
    @InjectRepository(AzeyoJokboLike)
    private readonly repository: Repository<AzeyoJokboLike>,
  ) {}

  async findByTemplateIdAndUserId(templateId: number, userId: number): Promise<AzeyoJokboLike | null> {
    return this.repository.findOneBy({ templateId, userId });
  }

  async save(like: Partial<AzeyoJokboLike>): Promise<AzeyoJokboLike> {
    const entity = this.repository.create(like);
    return this.repository.save(entity);
  }

  async softRemove(like: AzeyoJokboLike): Promise<void> {
    await this.repository.softRemove(like);
  }

  async findManyByTemplateIdsAndUserId(templateIds: number[], userId: number): Promise<AzeyoJokboLike[]> {
    if (templateIds.length === 0) return [];
    return this.repository.findBy({ templateId: In(templateIds), userId });
  }

  async countByTemplateIds(templateIds: number[]): Promise<{ templateId: number; count: number }[]> {
    if (templateIds.length === 0) return [];
    return this.repository.createQueryBuilder('like')
      .select('like.template_id', 'templateId')
      .addSelect('COUNT(like.id)', 'count')
      .where('like.template_id IN (:...templateIds)', { templateIds })
      .groupBy('like.template_id')
      .getRawMany();
  }
}
