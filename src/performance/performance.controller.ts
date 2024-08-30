import { RestApiController, RestApiGet } from '@/common/decorator/rest-api';
import { PerformanceService } from '@/performance/performance.service';
import { PerformancesResponse } from '@/performance/dto/response/performances.response';
import { Query } from '@nestjs/common';
import { GetPerformancesRequest } from '@/performance/dto/request/get-performances.request';

@RestApiController('/performances', 'Performance')
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  @RestApiGet(PerformancesResponse, { path: '/', description: '공연 목록 조회' })
  async getPerformances(@Query() request: GetPerformancesRequest) {
    const { items, totalCount } = await this.performanceService.getPagingPerformances(request.toQuery());
    return new PerformancesResponse({ performances: items, totalCount: totalCount });
  }
}
