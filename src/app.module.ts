import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
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
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-ioredis';
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
];
const modules = [
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
];

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
    }),
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: process.env['REDIS_HOST'],
      port: process.env['REDIS_PORT'],
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
    }),
    ...modules,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
