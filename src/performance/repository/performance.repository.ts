import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, In, Repository } from 'typeorm';
import { Performance } from '@/performance/performance.entity';
import { PerformanceNotFound } from '@/performance/exception/performance.exception';
import { PerformanceFetcher } from '@/performance/repository/operation/performance.fetcher';

@Injectable()
export class PerformanceRepository {
  constructor(
    @InjectRepository(Performance)
    private performanceRepository: Repository<Performance>,
  ) {}

  async find(fetcher: PerformanceFetcher): Promise<Performance[]> {
    const jobIdsQueryBuilder = this.performanceRepository.createQueryBuilder('performance');

    if (fetcher.provinceIds.length) {
      const provinces = await this.provinceRepository.findBy({ id: In(fetcher.provinceIds) });
      jobIdsQueryBuilder.andWhere('jobProvinces.provinceId IN (:...provinceIds)', { provinceIds: provinces.map(province => province.id) });
    }

    if (fetcher.types.length) {
      jobIdsQueryBuilder.andWhere('job.type IN (:...types)', { types: fetcher.types });
    }

    if (fetcher.professionalFields.length) {
      jobIdsQueryBuilder.andWhere('majorCategory.secondGroupEn IN (:...professionalFields)', { professionalFields: fetcher.professionalFields });
    }

    if (fetcher.keyword) {
      jobIdsQueryBuilder.andWhere(
        new Brackets(qb => {
          qb.where('LOWER(job.title) LIKE LOWER(:keyword)', { keyword: `%${fetcher.keyword}%` })
            .orWhere('LOWER(job.address) LIKE LOWER(:keyword)', { keyword: `%${fetcher.keyword}%` })
            .orWhere('LOWER(job.contents) LIKE LOWER(:keyword)', { keyword: `%${fetcher.keyword}%` })
            .orWhere('LOWER(majorCategory.koName) LIKE LOWER(:keyword)', { keyword: `%${fetcher.keyword}%` })
            .orWhere('LOWER(majorCategory.enName) LIKE LOWER(:keyword)', { keyword: `%${fetcher.keyword}%` });
        }),
      );
    }

    const jobIds = await jobIdsQueryBuilder.getMany();

    if (!jobIds.length) {
      this.eventEmitter.emit('jobs.fetched', redisKey, []);
      return [];
    }

    const queryBuilder = this.jobRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.user', 'user')
      .leftJoinAndSelect('job.jobMajorCategories', 'jobMajorCategories')
      .leftJoinAndSelect('job.jobProvinces', 'jobProvinces')
      .leftJoinAndSelect('jobMajorCategories.majorCategory', 'majorCategory')
      .whereInIds(jobIds.map(job => job.id));

    const jobs = await queryBuilder.orderBy('job.createdAt', 'DESC').skip(fetcher.skip).take(fetcher.take).getMany();

    this.eventEmitter.emit('jobs.fetched', redisKey, jobs);

    return jobs;
  }

  async findOneOrThrowById(id: number): Promise<Performance> {
    const performance = await this.performanceRepository.findOne({ where: { id } });
    if (!performance) throw new PerformanceNotFound();

    return performance;
  }
}
