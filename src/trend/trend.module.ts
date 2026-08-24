import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrendController } from '@/trend/controller/trend.controller';
import { TrendService } from '@/trend/service/trend.service';
import { TrendNewsFetcher } from '@/trend/service/trend-news.fetcher';
import { TrendSummaryAiService } from '@/trend/service/trend-summary-ai.service';
import { RedisRepository } from '@/common/redis/redis-repository.service';
import { TrendArchiveService } from '@/trend/service/trend-archive.service';
import { TrendArchiveRollupScheduler } from '@/trend/scheduler/trend-archive-rollup.scheduler';
import { TrendSummaryEntity } from '@/trend/entity/trend-summary.entity';
import { TrendDailyKeyword } from '@/trend/entity/trend-daily-keyword.entity';
import { TrendDailyHourlyTop } from '@/trend/entity/trend-daily-hourly-top.entity';
import { TrendSummaryRepository } from '@/trend/repository/trend-summary.repository';
import { TrendDailyRepository } from '@/trend/repository/trend-daily.repository';
import { TrendSummaryPrewarmScheduler } from '@/trend/scheduler/trend-summary-prewarm.scheduler';
import { TrendReactionService } from '@/trend/service/trend-reaction.service';

@Module({
  imports: [TypeOrmModule.forFeature([TrendSummaryEntity, TrendDailyKeyword, TrendDailyHourlyTop])],
  controllers: [TrendController],
  providers: [
    TrendService,
    TrendNewsFetcher,
    TrendSummaryAiService,
    TrendArchiveService,
    TrendSummaryRepository,
    TrendDailyRepository,
    TrendSummaryPrewarmScheduler,
    TrendArchiveRollupScheduler,
    TrendReactionService,
    RedisRepository,
  ],
})
export class TrendModule {}
