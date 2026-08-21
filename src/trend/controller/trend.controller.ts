import { Query } from '@nestjs/common';
import { RestApiController, RestApiGet } from '@/common/decorator/rest-api';
import { TrendService } from '@/trend/service/trend.service';
import { GetTrendSummaryRequest } from '@/trend/dto/request/get-trend-summary.request';
import { TrendSummaryResponse } from '@/trend/dto/response/trend-summary.response';
import { TrendArchiveService } from '@/trend/service/trend-archive.service';
import { GetTrendArchiveRequest } from '@/trend/dto/request/get-trend-archive.request';
import { TrendArchiveResponse } from '@/trend/dto/response/trend-archive.response';

@RestApiController('/trend', 'Trend')
export class TrendController {
  constructor(
    private readonly trendService: TrendService,
    private readonly archiveService: TrendArchiveService,
  ) {}

  @RestApiGet(TrendSummaryResponse, {
    path: '/summary',
    description: '실시간 검색어가 왜 순위에 올랐는지 관련 뉴스 본문을 종합해 AI 요약 (Redis 2시간 캐시, 1~10위는 매분 선생성)',
  })
  async getSummary(@Query() request: GetTrendSummaryRequest): Promise<TrendSummaryResponse> {
    return this.trendService.getSummary(request);
  }

  @RestApiGet(TrendArchiveResponse, {
    path: '/archive',
    description: '실시간 검색어 일간 누적 결산 — 기간(최대 31일) 내 키워드별 최고 순위·체류 시간·누적 점수 (매분 스케줄러가 기록)',
  })
  async getArchive(@Query() request: GetTrendArchiveRequest): Promise<TrendArchiveResponse> {
    return new TrendArchiveResponse(await this.archiveService.getArchive(request.from, request.to ?? request.from, request.limit));
  }
}
