import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PerformanceArea } from '@/performance/performance-area.entity';
import { PerformanceAreaNotFound } from '@/performance/performance-area.exception';

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
}
