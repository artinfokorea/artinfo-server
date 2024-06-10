import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { MajorCategory } from '@/job/entity/major-category.entity';
import { JobMajorCategory } from '@/job/entity/job-major-category.entity';
import { MajorNotFound } from '@/job/exception/job.exception';

@Injectable()
export class MajorCategoryRepository {
  constructor(
    @InjectRepository(MajorCategory)
    private majorCategoryRepository: Repository<MajorCategory>,

    @InjectRepository(JobMajorCategory)
    private fullTimeJobMajorCategoryRepository: Repository<JobMajorCategory>,
  ) {}

  async deleteByJobId(jobId: number): Promise<void> {
    await this.fullTimeJobMajorCategoryRepository.delete({ jobId: jobId });
  }

  async createJobMajorCategoriesOrThrow(jobId: number, majorCategoryIds: number[]): Promise<void> {
    const majorCategories = await this.majorCategoryRepository.findBy({ id: In(majorCategoryIds) });
    if (majorCategories.length !== majorCategoryIds.length) throw new MajorNotFound();

    const uniqueMajorCategoryIds = new Set<number>();
    majorCategoryIds.forEach(majorCategoryId => uniqueMajorCategoryIds.add(majorCategoryId));

    const FullTimeJobMajorCategories = [...uniqueMajorCategoryIds].map(majorCategoryId => {
      return this.fullTimeJobMajorCategoryRepository.create({ jobId: jobId, majorCategoryId: majorCategoryId });
    });

    await this.fullTimeJobMajorCategoryRepository.save(FullTimeJobMajorCategories);
  }

  findAll() {
    return this.majorCategoryRepository.find();
  }
}
