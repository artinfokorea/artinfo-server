import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from '@/job/entity/job.entity';
import { JobMajorCategory } from '@/job/entity/job-major-category.entity';
import { MajorCategory } from '@/job/entity/major-category.entity';
import { JobService } from '@/job/service/job.service';
import { JobRepository } from '@/job/repository/job.repository';
import { JobController } from '@/job/controller/job.controller';
import { MajorCategoryRepository } from '@/job/repository/major-category.repository';
import { Province } from '@/lesson/entity/province.entity';
import { JobProvince } from '@/job/entity/job-province.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Job, JobMajorCategory, JobProvince, MajorCategory, Province])],
  controllers: [JobController],
  providers: [JobService, JobRepository, MajorCategoryRepository],
})
export class JobModule {}
