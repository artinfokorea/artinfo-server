import { Module } from '@nestjs/common';
import { MajorService } from '@/major/major.service';
import { MajorController } from '@/major/major.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MajorCategory } from '@/job/entity/major-category.entity';
import { MajorCategoryRepository } from '@/job/repository/major-category.repository';
import { JobMajorCategory } from '@/job/entity/job-major-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MajorCategory, JobMajorCategory])],
  controllers: [MajorController],
  providers: [MajorService, MajorCategoryRepository],
})
export class MajorModule {}
