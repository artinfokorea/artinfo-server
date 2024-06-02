import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { MajorCategory } from '@/job/entity/major-category.entity';
import { jobMajorCategory } from '@/job/entity/job-major-category.entity';
import { MajorNotFound } from '@/job/exception/job.exception';

@Injectable()
export class MajorCategoryRepository {
  constructor(
    @InjectRepository(MajorCategory)
    private majorCategoryRepository: Repository<MajorCategory>,

    @InjectRepository(jobMajorCategory)
    private fullTimeJobMajorCategoryRepository: Repository<jobMajorCategory>,
  ) {}

  async deleteByJobId(jobId: number): Promise<void> {
    await this.fullTimeJobMajorCategoryRepository.delete({ jobId: jobId });
  }

  async linkFullTimeJobToMajorCategoriesOrThrow(jobId: number, majorCategoryIds: number[]): Promise<void> {
    const majorCategories = await this.majorCategoryRepository.findBy({ id: In(majorCategoryIds) });
    if (majorCategories.length !== majorCategoryIds.length) throw new MajorNotFound();

    const uniqueMajorCategoryIds = new Set<number>();
    majorCategoryIds.forEach(majorCategoryId => uniqueMajorCategoryIds.add(majorCategoryId));

    const FullTimeJobMajorCategories = [...uniqueMajorCategoryIds].map(majorCategoryId => {
      return this.fullTimeJobMajorCategoryRepository.create({ jobId: jobId, majorCategoryId: majorCategoryId });
    });

    await this.fullTimeJobMajorCategoryRepository.save(FullTimeJobMajorCategories);
  }
}
