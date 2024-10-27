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

@Module({
  imports: [TypeOrmModule.forFeature([Job, JobMajorCategory, JobProvince, MajorCategory, Province, User, JobSchedule])],
  controllers: [JobController],
  providers: [JobService, UserRepository, JobRepository, MajorRepository, RedisRepository, JobEvent],
})
export class JobModule {}
