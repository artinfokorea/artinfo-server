import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from '@/job/entity/job.entity';
import { jobMajorCategory } from '@/job/entity/job-major-category.entity';
import { MajorCategory } from '@/job/entity/major-category.entity';
import { JobService } from '@/job/service/job.service';
import { JobRepository } from '@/job/repository/job-repository.service';
import { JobController } from '@/job/controller/job.controller';
import { MajorCategoryRepository } from '@/job/repository/major-category.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Job, jobMajorCategory, MajorCategory])],
  controllers: [JobController],
  providers: [JobService, JobRepository, MajorCategoryRepository],
})
export class JobModule {}
