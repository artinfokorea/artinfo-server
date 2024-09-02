import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PerformanceArea } from '@/performance/performance-area.entity';
import { PerformanceAreaNotFound } from '@/performance/performance-area.exception';
import { PerformanceAreaFetcher } from '@/performance/repository/operation/performance-area.fetcher';
import { PerformanceAreaCounter } from '@/performance/repository/operation/performance-area.counter';

@Injectable()
export class PerformanceAreaRepository {
  constructor(
    @InjectRepository(PerformanceArea)
    private readonly performanceAreaRepository: Repository<PerformanceArea>,
  ) {}

  async findOneOrThrowById(id: number): Promise<PerformanceArea> {
    const area = await this.performanceAreaRepository.findOneBy({ id });
    if (!area) throw new PerformanceAreaNotFound();

    return area;
  }

  findOneByName(name: string): Promise<PerformanceArea | null> {
    return this.performanceAreaRepository.findOne({ where: { name: name } });
  }

  find(fetcher: PerformanceAreaFetcher): Promise<PerformanceArea[]> {
    return this.performanceAreaRepository
      .createQueryBuilder('area')
      .where('LOWER(area.name) LIKE LOWER(:keyword)', { keyword: `%${fetcher.keyword}%` })
      .orderBy('area.sequence', 'ASC')
      .addOrderBy('area.name', 'ASC')
      .skip(fetcher.skip)
      .take(fetcher.take)
      .getMany();
  }

  count(counter: PerformanceAreaCounter) {
    return this.performanceAreaRepository
      .createQueryBuilder('area')
      .where('LOWER(area.name) LIKE LOWER(:keyword)', { keyword: `%${counter.keyword}%` })
      .getCount();
  }
}
