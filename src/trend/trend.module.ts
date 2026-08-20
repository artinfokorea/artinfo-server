import { Module } from '@nestjs/common';
import { TrendController } from '@/trend/controller/trend.controller';
import { TrendService } from '@/trend/service/trend.service';
import { TrendNewsFetcher } from '@/trend/service/trend-news.fetcher';
import { TrendSummaryAiService } from '@/trend/service/trend-summary-ai.service';
import { RedisRepository } from '@/common/redis/redis-repository.service';

@Module({
  controllers: [TrendController],
  providers: [TrendService, TrendNewsFetcher, TrendSummaryAiService, RedisRepository],
})
export class TrendModule {}
