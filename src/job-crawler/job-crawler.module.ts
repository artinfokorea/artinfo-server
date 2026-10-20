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
import { MokpoArtJobCrawler } from './mokpo/mokpo-art-job.crawler';
import { MokpoNoticeClient } from './mokpo/mokpo-notice.client';
import { JobCrawlerScheduler } from './scheduler/job-crawler.scheduler';

/**
 * 외부 사이트의 채용 공고를 수집해 채용으로 등록한다.
 * 현재 소스: 목포시 고시·공고(목포시립예술단). 매일 23:00 KST 스케줄 + 관리자 수동 실행 API.
 */
@Module({
  imports: [TypeOrmModule.forFeature([Job, MajorCategory, User]), JobModule, DocumentConverterModule],
  controllers: [JobCrawlerController],
  providers: [MokpoNoticeClient, MokpoArtJobCrawler, JobCrawlerScheduler, AwsS3Service, UserRepository],
})
export class JobCrawlerModule {}
