import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { FULL_TIME_JOB_TYPE, FullTimeJob } from '@/job/entity/full-time-job.entity';
import { Paging } from '@/common/type/type';
import { FullTimeJobMajorCategory } from '@/job/entity/full-time-job-major-category.entity';

@Injectable()
export class FullTimeJobRepository {
  constructor(
    @InjectRepository(FullTimeJob)
    private fullTimeJobRepository: Repository<FullTimeJob>,

    @InjectRepository(FullTimeJobMajorCategory)
    private fullTimeJobMajorCategoryRepository: Repository<FullTimeJobMajorCategory>,
  ) {}

  async findBy(type: FULL_TIME_JOB_TYPE, categoryIds: number[], paging: Paging) {
    const fullTimeJobMajorCategories = await this.fullTimeJobMajorCategoryRepository.find({
      where: { majorCategoryId: In(categoryIds) },
    });

    const fullTimeJobIds = fullTimeJobMajorCategories.map(fullTimeJobMajorCategory => fullTimeJobMajorCategory.fullTimeJobId);

    const qb = this.fullTimeJobRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.fullTimeJobMajorCategories', 'jobMajorCategory')
      .leftJoinAndSelect('jobMajorCategory.majorCategory', 'majorCategory');

    if (fullTimeJobIds.length !== 0) {
      qb.andWhere('job.id IN (:...ids)', { ids: fullTimeJobIds });
    }

    return qb
      .andWhere('job.type = :type', { type })
      .skip((paging.page - 1) * paging.size)
      .take(paging.size)
      .getMany();
  }

  async countBy(type: FULL_TIME_JOB_TYPE, categoryIds: number[]) {
    const fullTimeJobMajorCategories = await this.fullTimeJobMajorCategoryRepository.find({
      where: { majorCategoryId: In(categoryIds) },
    });
    const fullTimeJobIds = fullTimeJobMajorCategories.map(fullTimeJobMajorCategory => fullTimeJobMajorCategory.fullTimeJobId);

    return await this.fullTimeJobRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.fullTimeJobMajorCategories', 'jobMajorCategory')
      .leftJoinAndSelect('jobMajorCategory.majorCategory', 'majorCategory')
      .where('job.id IN (:...ids)', { ids: fullTimeJobIds })
      .andWhere('job.type = :type', { type })
      .getCount();
  }
}
