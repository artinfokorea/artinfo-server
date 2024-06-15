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
import { Image } from '@/system/entity/image.entity';
import { LoggerModule } from '@/common/middleware/logger/logger.module';
import { LessonModule } from '@/lesson/lesson.module';
import { Lesson } from '@/lesson/entity/lesson.entity';
import { Province } from '@/lesson/entity/province.entity';
import { JobProvince } from '@/job/entity/job-province.entity';
import { ProvinceModule } from '@/province/province.module';
import { LessonArea } from '@/lesson/entity/lesson-area.entity';

const entities = [
  User,
  School,
  Lesson,
  LessonArea,
  Province,
  Auth,
  Advertisement,
  Job,
  JobMajorCategory,
  JobProvince,
  MajorCategory,
  UserMajorCategory,
  JobMajorCategory,
  Image,
];
const modules = [
  SystemModule,
  MajorModule,
  RedisModule,
  AuthModule,
  UserModule,
  LessonModule,
  AdvertisementModule,
  JobModule,
  ProvinceModule,
  MajorModule,
  LoggerModule,
];

@Module({
  imports: [
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
      synchronize: true,
      logging: false,
    }),
    ...modules,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
