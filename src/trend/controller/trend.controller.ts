import { Query } from '@nestjs/common';
import { RestApiController, RestApiGet } from '@/common/decorator/rest-api';
import { TrendService } from '@/trend/service/trend.service';
import { GetTrendSummaryRequest } from '@/trend/dto/request/get-trend-summary.request';
import { TrendSummaryResponse } from '@/trend/dto/response/trend-summary.response';

@RestApiController('/trend', 'Trend')
export class TrendController {
  constructor(private readonly trendService: TrendService) {}

  @RestApiGet(TrendSummaryResponse, {
    path: '/summary',
    description: '실시간 검색어가 왜 순위에 올랐는지 관련 뉴스 본문을 종합해 AI 요약 (Redis 1시간 캐시)',
  })
  async getSummary(@Query() request: GetTrendSummaryRequest): Promise<TrendSummaryResponse> {
    return this.trendService.getSummary(request);
  }
}
