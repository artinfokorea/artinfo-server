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
import { jobMajorCategory } from '@/job/entity/job-major-category.entity';
import { MajorCategory } from '@/job/entity/major-category.entity';

const entities = [User, Auth, Advertisement, Job, jobMajorCategory, MajorCategory];
const modules = [AuthModule, UserModule, AdvertisementModule, JobModule];

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
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
      logging: true,
    }),
    ...modules,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
