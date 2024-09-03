import { Injectable } from '@nestjs/common';
import { PerformanceRepository } from '@/performance/repository/performance.repository';
import { PagingItems } from '@/common/type/type';
import { GetPerformancesQuery } from '@/performance/dto/query/get-performances.query';
import { Performance } from '@/performance/performance.entity';
import { PerformanceAreaRepository } from '@/performance/repository/performance-area.repository';
import { CreatePerformanceCommand } from '@/performance/dto/command/create-performance.command';
import { PerformanceArea } from '@/performance/performance-area.entity';
import { UserRepository } from '@/user/repository/user.repository';
import { EditPerformanceCommand } from '@/performance/dto/command/edit-performance.command';
import { PerformanceCounter } from '@/performance/repository/operation/performance.counter';

@Injectable()
export class PerformanceService {
  constructor(
    private readonly performanceRepository: PerformanceRepository,
    private readonly performanceAreaRepository: PerformanceAreaRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async countPreArrangedPerformance() {
    const performanceCounter = new PerformanceCounter({
      keyword: null,
      categories: [],
      provinceIds: [],
      isPreArranged: true,
    });
    return await this.performanceRepository.count(performanceCounter);
  }

  async editPerformance(command: EditPerformanceCommand): Promise<void> {
    let area: PerformanceArea | null = null;
    if (command.areaId) area = await this.performanceAreaRepository.findOneOrThrowById(command.areaId);

    await this.performanceRepository.editOrThrow(command.toEditor(area));
  }

  async createPerformance(command: CreatePerformanceCommand): Promise<number> {
    const user = await this.userRepository.findOneOrThrowById(command.userId);
    let performanceArea: PerformanceArea | null = null;
    if (command.areaId) performanceArea = await this.performanceAreaRepository.findOneOrThrowById(command.areaId);

    return await this.performanceRepository.create(command.toCreator(user, performanceArea));
  }

  async getPagingPerformances(query: GetPerformancesQuery): Promise<PagingItems<Performance>> {
    const performances = await this.performanceRepository.find(query.toFetcher());
    const totalCount = await this.performanceRepository.count(query.toCounter());

    return { items: performances, totalCount: totalCount };
  }

  getPerformance(performanceId: number) {
    return this.performanceRepository.findOneOrThrowById(performanceId);
  }

  async deletePerformance(userId: number, performanceId: number) {
    await this.performanceRepository.deleteOrThrow(userId, performanceId);
  }
}
