import { Module } from '@nestjs/common';
import { SchedulerLockModule } from '@/common/scheduler/scheduler-lock.module';
import { CompetitionController } from './competition.controller';
import { CompetitionRepository } from './competition.repository';
import { CompetitionService } from './competition.service';
import { AwsS3Service } from '@/aws/s3/aws-s3.service';
import { CompetitionCrawlerScheduler } from './crawler/competition-crawler.scheduler';
import { CompetitionImageStore } from './crawler/competition-image.store';
import { ContestCompetitionCrawler } from './crawler/contest-competition.crawler';
import { ContestNoticeClient } from './crawler/contest-notice.client';

/** 콩쿠르 공고 — 회원 직접 등록(검토 후 게시) + contest.co.kr 수집(매일 23:10 KST). 테이블은 기동 시 멱등 생성 */
@Module({
  imports: [SchedulerLockModule],
  controllers: [CompetitionController],
  providers: [
    CompetitionRepository,
    CompetitionService,
    ContestNoticeClient,
    AwsS3Service,
    CompetitionImageStore,
    ContestCompetitionCrawler,
    CompetitionCrawlerScheduler,
  ],
  exports: [CompetitionRepository, CompetitionService],
})
export class CompetitionModule {}
