import { Module } from '@nestjs/common';
import { CommonService } from '@/common/api/common.service';
import { CommonController } from '@/common/api/common.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MajorCategory } from '@/job/entity/major-category.entity';
import { MajorCategoryRepository } from '@/job/repository/major-category.repository';
import { JobMajorCategory } from '@/job/entity/job-major-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MajorCategory, JobMajorCategory])],
  controllers: [CommonController],
  providers: [CommonService, MajorCategoryRepository],
})
export class CommonModule {}
