import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FullTimeJob } from '@/job/entity/full-time-job.entity';
import { FullTimeJobMajorCategory } from '@/job/entity/full-time-job-major-category.entity';
import { MajorCategory } from '@/job/entity/major-category.entity';
import { FullTimeJobService } from '@/job/service/full-time-job.service';
import { FullTimeJobRepository } from '@/job/repository/full-time-job.repository';
import { JobController } from '@/job/controller/job.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FullTimeJob, FullTimeJobMajorCategory, MajorCategory])],
  providers: [FullTimeJobService, FullTimeJobRepository],
  controllers: [JobController],
})
export class JobModule {}
