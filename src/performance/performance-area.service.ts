import { Injectable } from '@nestjs/common';
import { PerformanceAreaRepository } from '@/performance/repository/performance-area.repository';
import { GetPerformanceAreasQuery } from '@/performance/dto/query/get-performance-areas.query';
import { PagingItems } from '@/common/type/type';
import { PerformanceArea } from '@/performance/performance-area.entity';

@Injectable()
export class PerformanceAreaService {
  constructor(private readonly performanceAreaRepository: PerformanceAreaRepository) {}

  async getPagingPerformanceAreas(query: GetPerformanceAreasQuery): Promise<PagingItems<PerformanceArea>> {
    const areas = await this.performanceAreaRepository.find(query.toFetcher());
    const totalCount = await this.performanceAreaRepository.count(query.toCounter());

    return { items: areas, totalCount: totalCount };
  }
}
