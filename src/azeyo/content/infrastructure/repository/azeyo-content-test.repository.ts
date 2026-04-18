import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AzeyoContentTest } from '@/azeyo/content/domain/entity/azeyo-content-test.entity';
import { IAzeyoContentTestRepository } from '@/azeyo/content/domain/repository/azeyo-content-test.repository.interface';

@Injectable()
export class AzeyoContentTestRepository implements IAzeyoContentTestRepository {
  constructor(
    @InjectRepository(AzeyoContentTest)
    private readonly repo: Repository<AzeyoContentTest>,
  ) {}

  async findActiveTests(): Promise<AzeyoContentTest[]> {
    return this.repo.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  async findBySlug(slug: string): Promise<AzeyoContentTest | null> {
    return this.repo.findOne({ where: { slug, isActive: true } });
  }
}
