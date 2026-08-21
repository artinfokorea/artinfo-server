import { Module } from '@nestjs/common';
import { TrendController } from '@/trend/controller/trend.controller';
import { TrendService } from '@/trend/service/trend.service';
import { TrendNewsFetcher } from '@/trend/service/trend-news.fetcher';
import { TrendSummaryAiService } from '@/trend/service/trend-summary-ai.service';
import { RedisRepository } from '@/common/redis/redis-repository.service';
import { TrendArchiveService } from '@/trend/service/trend-archive.service';
import { TrendSummaryPrewarmScheduler } from '@/trend/scheduler/trend-summary-prewarm.scheduler';

@Module({
  controllers: [TrendController],
  providers: [TrendService, TrendNewsFetcher, TrendSummaryAiService, TrendSummaryPrewarmScheduler, TrendArchiveService, RedisRepository],
})
export class TrendModule {}
