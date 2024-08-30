import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PerformanceArea } from '@/performance/performance-area.entity';

@Injectable()
export class PerformanceAreaRepository {
  constructor(
    @InjectRepository(PerformanceArea)
    private readonly performanceAreaRepository: Repository<PerformanceArea>,
  ) {}

  findOneByName(name: string): Promise<PerformanceArea | null> {
    return this.performanceAreaRepository.findOne({ where: { name: name } });
  }
}