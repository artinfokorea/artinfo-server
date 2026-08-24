import { Body, Query } from '@nestjs/common';
import { RestApiController, RestApiGet, RestApiPost } from '@/common/decorator/rest-api';
import { TrendService } from '@/trend/service/trend.service';
import { GetTrendSummaryRequest } from '@/trend/dto/request/get-trend-summary.request';
import { TrendSummaryResponse } from '@/trend/dto/response/trend-summary.response';
import { TrendArchiveService } from '@/trend/service/trend-archive.service';
import { GetTrendArchiveRequest } from '@/trend/dto/request/get-trend-archive.request';
import { TrendArchiveResponse } from '@/trend/dto/response/trend-archive.response';
import { TrendReactionService } from '@/trend/service/trend-reaction.service';
import { AddTrendReactionRequest, GetTrendReactionsRequest } from '@/trend/dto/request/trend-reaction.request';
import { TrendReactionsResponse } from '@/trend/dto/response/trend-reaction.response';

@RestApiController('/trend', 'Trend')
export class TrendController {
  constructor(
    private readonly trendService: TrendService,
    private readonly archiveService: TrendArchiveService,
    private readonly reactionService: TrendReactionService,
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

  @RestApiGet(TrendReactionsResponse, {
    path: '/reactions',
    description: '키워드 이슈에 대한 익명 이모지 반응 집계 (Redis, 14일 보관)',
  })
  async getReactions(@Query() request: GetTrendReactionsRequest): Promise<TrendReactionsResponse> {
    return this.reactionService.getCounts(request.keyword);
  }

  @RestApiPost(TrendReactionsResponse, {
    path: '/reactions',
    description: '키워드 이슈에 반응 투표 — previous를 주면 이전 반응을 차감하고 새 반응으로 교체',
  })
  async addReaction(@Body() request: AddTrendReactionRequest): Promise<TrendReactionsResponse> {
    return this.reactionService.add(request.keyword, request.reaction, request.previous);
  }
}
