import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { User } from './user/entity/user.entity';
import { UserModule } from '@/user/user.module';
import { AuthModule } from '@/auth/auth.module';
import { AdvertisementModule } from '@/system/module/advertisement.module';
import { JobModule } from '@/job/module/job.module';
import { Auth } from '@/auth/entity/auth.entity';
import { Advertisement } from '@/system/entity/advertisement.entity';
import { Job } from '@/job/entity/job.entity';
import { JobMajorCategory } from '@/job/entity/job-major-category.entity';
import { MajorCategory } from '@/job/entity/major-category.entity';
import { SystemModule } from '@/system/module/system.module';
import { School } from '@/user/entity/school.entity';
import { UserMajorCategory } from '@/user/entity/user-major-category.entity';
import { RedisModule } from '@/common/redis/redis.module';
import { MajorModule } from '@/major/major.module';
import { ImageEntity } from '@/system/entity/image.entity';
import { LoggerModule } from '@/common/middleware/logger/logger.module';
import { LessonModule } from '@/lesson/lesson.module';
import { Lesson } from '@/lesson/entity/lesson.entity';
import { Province } from '@/lesson/entity/province.entity';
import { JobProvince } from '@/job/entity/job-province.entity';
import { ProvinceModule } from '@/province/province.module';
import { LessonArea } from '@/lesson/entity/lesson-area.entity';
import { Inquiry } from '@/system/entity/inquiry.entity';
import { InquiryModule } from '@/system/module/inquiry.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { NewsModule } from '@/news/news.module';
import { CommentModule } from '@/comment/comment.module';
import { CommentEntity } from '@/comment/comment.entity';
import { Performance } from '@/performance/performance.entity';
import { PerformanceArea } from '@/performance/performance-area.entity';
import { PerformanceModule } from '@/performance/performance.module';
import { JobSchedule } from '@/job/entity/job-schedule.entity';
import { JobUser } from '@/job/entity/job-user.entity';
import { PostEntity } from '@/post/PostEntity';
import { PostModule } from '@/post/PostModule';
import { LikeEntity } from '@/like/LikeEntity';
import { LessonApplicationEntity } from '@/lesson/entity/lesson-application.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulerModule } from '@/common/scheduler/SchedulerModule';
import { Admission } from '@/admission/entity/admission.entity';
import { AdmissionRound } from '@/admission/entity/admission-round.entity';
import { AdmissionRoundTask } from '@/admission/entity/admission-round-task.entity';
import { AdmissionModule } from '@/admission/admission.module';
import { TovModule } from '@/tov/tov.module';
import { AzeyoModule } from '@/azeyo/azeyo.module';
import { AzeyoUser } from '@/azeyo/user/domain/entity/azeyo-user.entity';
import { AzeyoAuth } from '@/azeyo/auth/domain/entity/azeyo-auth.entity';
import { AzeyoCommunityPost } from '@/azeyo/community/domain/entity/azeyo-community-post.entity';
import { AzeyoCommunityVote } from '@/azeyo/community/domain/entity/azeyo-community-vote.entity';
import { AzeyoCommunityLike } from '@/azeyo/community/domain/entity/azeyo-community-like.entity';
import { AzeyoCommunityComment } from '@/azeyo/community/domain/entity/azeyo-community-comment.entity';
import { AzeyoJokboTemplate } from '@/azeyo/jokbo/domain/entity/azeyo-jokbo-template.entity';
import { AzeyoNotification } from '@/azeyo/notification/domain/entity/azeyo-notification.entity';
import { AzeyoNotificationSetting } from '@/azeyo/notification/domain/entity/azeyo-notification-setting.entity';
import { AzeyoJokboLike } from '@/azeyo/jokbo/domain/entity/azeyo-jokbo-like.entity';
import { AzeyoSchedule } from '@/azeyo/schedule/domain/entity/azeyo-schedule.entity';
import { AzeyoScheduleTag } from '@/azeyo/schedule/domain/entity/azeyo-schedule-tag.entity';
import { AzeyoScheduleRecommendation } from '@/azeyo/schedule/domain/entity/azeyo-schedule-recommendation.entity';
import { AzeyoAlimtalkHistory } from '@/azeyo/notification/domain/entity/azeyo-alimtalk-history.entity';
import { OnchurchModule } from '@/onchurch/onchurch.module';
import { OnchurchUser } from '@/onchurch/user/domain/entity/onchurch-user.entity';
import { OnchurchAuth } from '@/onchurch/auth/domain/entity/onchurch-auth.entity';
import { OnchurchChurch } from '@/onchurch/church/domain/entity/onchurch-church.entity';
import { OnchurchBanner } from '@/onchurch/banner/domain/entity/onchurch-banner.entity';
import { OnchurchNotice } from '@/onchurch/notice/domain/entity/onchurch-notice.entity';
import { OnchurchEvent } from '@/onchurch/event/domain/entity/onchurch-event.entity';
import { OnchurchPastor } from '@/onchurch/about/domain/entity/onchurch-pastor.entity';
import { OnchurchVision } from '@/onchurch/about/domain/entity/onchurch-vision.entity';
import { OnchurchHistory } from '@/onchurch/about/domain/entity/onchurch-history.entity';
import { OnchurchStaff } from '@/onchurch/about/domain/entity/onchurch-staff.entity';

const entities = [
  User,
  School,
  Lesson,
  LessonArea,
  LessonApplicationEntity,
  Province,
  Performance,
  PerformanceArea,
  Auth,
  Advertisement,
  Job,
  JobMajorCategory,
  JobProvince,
  JobSchedule,
  JobUser,
  MajorCategory,
  UserMajorCategory,
  JobMajorCategory,
  ImageEntity,
  Inquiry,
  CommentEntity,
  PostEntity,
  LikeEntity,
  Admission,
  AdmissionRound,
  AdmissionRoundTask,
  AzeyoUser,
  AzeyoAuth,
  AzeyoCommunityPost,
  AzeyoCommunityVote,
  AzeyoCommunityLike,
  AzeyoCommunityComment,
  AzeyoJokboTemplate,
  AzeyoJokboLike,
  AzeyoSchedule,
  AzeyoScheduleTag,
  AzeyoScheduleRecommendation,
  AzeyoNotification,
  AzeyoNotificationSetting,
  AzeyoAlimtalkHistory,
  OnchurchUser,
  OnchurchAuth,
  OnchurchChurch,
  OnchurchBanner,
  OnchurchNotice,
  OnchurchEvent,
  OnchurchPastor,
  OnchurchVision,
  OnchurchHistory,
  OnchurchStaff,
];
const modules = [
  SchedulerModule,
  SystemModule,
  MajorModule,
  RedisModule,
  AuthModule,
  UserModule,
  PostModule,
  LessonModule,
  NewsModule,
  AdvertisementModule,
  JobModule,
  ProvinceModule,
  MajorModule,
  CommentModule,
  InquiryModule,
  PerformanceModule,
  LoggerModule,
  AdmissionModule,
  TovModule,
  AzeyoModule,
  OnchurchModule,
];

@Module({
  imports: [
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
    }),
    BullModule.forRoot({
      connection: {
        host: process.env['REDIS_HOST'],
        port: parseInt(process.env['REDIS_PORT'] ?? '6379', 10),
      },
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env['DATABASE_HOST'],
      port: Number(process.env['DATABASE_PORT']),
      username: process.env['DATABASE_USER_NAME'],
      password: process.env['DATABASE_PASSWORD'],
      database: process.env['DATABASE_NAME'],
      entities: entities,
      autoLoadEntities: true,
      synchronize: false,
      logging: false,
      extra: {
        max: 20,
        min: 5,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
        application_name: 'artinfo-nestjs',
        keepAlive: true,
        keepAliveInitialDelayMillis: 10000,
        statement_timeout: 15000,
      },
      retryAttempts: 10,
      retryDelay: 3000,
    }),
    ...modules,
  ],
})
export class AppModule {}
