import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from '@/job/entity/job.entity';
import { JobMajorCategory } from '@/job/entity/job-major-category.entity';
import { MajorCategory } from '@/job/entity/major-category.entity';
import { JobService } from '@/job/service/job.service';
import { JobRepository } from '@/job/repository/job.repository';
import { JobController } from '@/job/controller/job.controller';
import { MajorRepository } from '@/major/repository/major.repository';
import { Province } from '@/lesson/entity/province.entity';
import { JobProvince } from '@/job/entity/job-province.entity';
import { RedisRepository } from '@/common/redis/redis-repository.service';
import { JobEvent } from '@/job/event/job.event';
import { UserRepository } from '@/user/repository/user.repository';
import { User } from '@/user/entity/user.entity';
import { JobSchedule } from '@/job/entity/job-schedule.entity';
import { JobUser } from '@/job/entity/job-user.entity';
import { SystemService } from '@/system/service/system.service';
import { AwsS3Service } from '@/aws/s3/aws-s3.service';
import { ImageEntity } from '@/system/entity/image.entity';
import { ImageRepository } from '@/system/repository/image.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Job, JobMajorCategory, JobUser, JobProvince, MajorCategory, Province, User, JobSchedule, ImageEntity])],
  controllers: [JobController],
  providers: [JobService, UserRepository, JobRepository, MajorRepository, RedisRepository, JobEvent, SystemService, AwsS3Service, ImageRepository],
})
export class JobModule {}
