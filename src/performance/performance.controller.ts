import { RestApiController, RestApiGet } from '@/common/decorator/rest-api';
import { PerformanceService } from '@/performance/performance.service';
import { PerformancesResponse } from '@/performance/dto/response/performances.response';
import { Param, Query } from '@nestjs/common';
import { GetPerformancesRequest } from '@/performance/dto/request/get-performances.request';
import { PerformanceDetailResponse } from '@/performance/dto/response/performance-detail.response';

@RestApiController('/performances', 'Performance')
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  @RestApiGet(PerformancesResponse, { path: '/', description: '공연 목록 조회' })
  async getPerformances(@Query() request: GetPerformancesRequest) {
    const { items, totalCount } = await this.performanceService.getPagingPerformances(request.toQuery());
    return new PerformancesResponse({ performances: items, totalCount: totalCount });
  }

  @RestApiGet(PerformanceDetailResponse, { path: '/:performanceId', description: '공연 단건 조회' })
  async getPerformance(@Param('performanceId') performanceId: number) {
    const performance = await this.performanceService.getPerformance(performanceId);
    return new PerformanceDetailResponse(performance);
  }
}
