import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, Repository } from 'typeorm';
import { FULL_TIME_JOB_TYPE, FullTimeJob } from '@/job/entity/full-time-job.entity';
import { Paging } from '@/common/type/type';
import { JobNotFound } from '@/job/exception/job.exception';

@Injectable()
export class FullTimeJobRepository {
  constructor(
    @InjectRepository(FullTimeJob)
    private fullTimeJobRepository: Repository<FullTimeJob>,
  ) {}

  async findBy(type: FULL_TIME_JOB_TYPE, categoryIds: number[], paging: Paging) {
    const where: FindOptionsWhere<FullTimeJob> = { type: type };

    if (categoryIds.length) {
      where.fullTimeJobMajorCategories = { majorCategory: { id: In(categoryIds) } };
    }

    return this.fullTimeJobRepository.find({
      relations: ['fullTimeJobMajorCategories.majorCategory'],
      where: { type: type },
      skip: (paging.page - 1) * paging.size,
      take: paging.size,
    });
  }

  async findOneOrThrowById(id: number): Promise<FullTimeJob> {
    const job = await this.fullTimeJobRepository.findOneBy({ id });
    if (!job) throw new JobNotFound();

    return job;
  }

  async countBy(type: FULL_TIME_JOB_TYPE, categoryIds: number[]) {
    const queryBuilder = this.fullTimeJobRepository
      .createQueryBuilder('job')
      .leftJoin('job.fullTimeJobMajorCategories', 'jobMajorCategory')
      .where('job.type = :type', { type });

    if (categoryIds.length) {
      queryBuilder.andWhere('jobMajorCategory.majorCategoryId IN (:...categoryIds)', { categoryIds });
    }

    return queryBuilder.getCount();
  }
}
