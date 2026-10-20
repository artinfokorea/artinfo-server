import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AwsS3Service } from '@/aws/s3/aws-s3.service';
import { DocumentConverterModule } from '@/document-converter/document-converter.module';
import { Job } from '@/job/entity/job.entity';
import { MajorCategory } from '@/job/entity/major-category.entity';
import { JobModule } from '@/job/module/job.module';
import { User } from '@/user/entity/user.entity';
import { UserRepository } from '@/user/repository/user.repository';
import { JobCrawlerController } from './controller/job-crawler.controller';
import { JobCrawlerService } from './job-crawler.service';
import { MokpoArtJobCrawler } from './mokpo/mokpo-art-job.crawler';
import { MokpoNoticeClient } from './mokpo/mokpo-notice.client';
import { JobCrawlerScheduler } from './scheduler/job-crawler.scheduler';
import { JOB_SOURCE_CRAWLERS, JobSourceCrawler } from './source/job-source';
import { JobSourceSupport } from './source/job-source.support';

/**
 * 외부 사이트의 채용 공고를 수집해 채용으로 등록한다. 매일 23:00 KST 스케줄 + 관리자 수동 실행 API.
 * 새 기관을 붙이려면: JobSourceCrawler 구현 → providers 에 추가 → 아래 JOB_SOURCE_CRAWLERS 목록에 넣는다.
 */
@Module({
  imports: [TypeOrmModule.forFeature([Job, MajorCategory, User]), JobModule, DocumentConverterModule],
  controllers: [JobCrawlerController],
  providers: [
    JobCrawlerService,
    JobCrawlerScheduler,
    JobSourceSupport,
    AwsS3Service,
    UserRepository,
    MokpoNoticeClient,
    MokpoArtJobCrawler,
    {
      provide: JOB_SOURCE_CRAWLERS,
      useFactory: (...sources: JobSourceCrawler[]) => sources,
      inject: [MokpoArtJobCrawler],
    },
  ],
})
export class JobCrawlerModule {}
