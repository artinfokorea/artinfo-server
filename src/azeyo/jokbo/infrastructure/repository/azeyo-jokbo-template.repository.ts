import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AzeyoJokboTemplate, AZEYO_JOKBO_CATEGORY } from '@/azeyo/jokbo/domain/entity/azeyo-jokbo-template.entity';
import { IAzeyoJokboTemplateRepository } from '@/azeyo/jokbo/domain/repository/azeyo-jokbo-template.repository.interface';
import { AzeyoJokboTemplateNotFound } from '@/azeyo/jokbo/domain/exception/azeyo-jokbo.exception';

@Injectable()
export class AzeyoJokboTemplateRepository implements IAzeyoJokboTemplateRepository {
  constructor(
    @InjectRepository(AzeyoJokboTemplate)
    private readonly repository: Repository<AzeyoJokboTemplate>,
  ) {}

  async create(template: Partial<AzeyoJokboTemplate>): Promise<AzeyoJokboTemplate> {
    const entity = this.repository.create(template);
    return this.repository.save(entity);
  }

  async findOneByIdOrThrow(id: number): Promise<AzeyoJokboTemplate> {
    const template = await this.repository.findOneBy({ id });
    if (!template) throw new AzeyoJokboTemplateNotFound();
    return template;
  }

  async findOneByIdAndUserIdOrThrow(id: number, userId: number): Promise<AzeyoJokboTemplate> {
    const template = await this.repository.findOneBy({ id, userId });
    if (!template) throw new AzeyoJokboTemplateNotFound();
    return template;
  }

  async findManyPaging(params: {
    skip: number;
    take: number;
    category: AZEYO_JOKBO_CATEGORY | null;
  }): Promise<{ items: AzeyoJokboTemplate[]; totalCount: number }> {
    const qb = this.repository.createQueryBuilder('template')
      .leftJoinAndSelect('template.user', 'user');

    if (params.category) {
      qb.where('template.category = :category', { category: params.category });
    }

    const [items, totalCount] = await qb
      .orderBy('template.createdAt', 'DESC')
      .skip(params.skip)
      .take(params.take)
      .getManyAndCount();

    return { items, totalCount };
  }

  async findManyByUserId(userId: number): Promise<AzeyoJokboTemplate[]> {
    return this.repository.createQueryBuilder('template')
      .leftJoinAndSelect('template.user', 'user')
      .where('template.userId = :userId', { userId })
      .orderBy('template.createdAt', 'DESC')
      .getMany();
  }

  async incrementCopyCount(id: number): Promise<void> {
    await this.repository.increment({ id }, 'copyCount', 1);
  }

  async softRemove(template: AzeyoJokboTemplate): Promise<void> {
    await this.repository.softRemove(template);
  }
}
