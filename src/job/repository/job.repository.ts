import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { Job } from '@/job/entity/job.entity';
import { JobNotFound } from '@/job/exception/job.exception';
import { JobCreator } from '@/job/repository/operation/job.creator';
import { JobEditor } from '@/job/repository/operation/job.editor';
import { JobFetcher } from '@/job/repository/operation/job.fetcher';
import { JobCounter } from '@/job/repository/operation/job.counter';
import { province } from '@/system/entity/province';

@Injectable()
export class JobRepository {
  constructor(
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
  ) {}

  async create(creator: JobCreator): Promise<number> {
    const job = await this.jobRepository.save({
      user: { id: creator.userId },
      type: creator.type,
      title: creator.title,
      companyName: creator.companyName,
      contents: creator.contents,
      address: creator.address,
      fee: creator.fee,
      imageUrl: creator.imageUrl,
    });

    return job.id;
  }

  async editOrThrow(editor: JobEditor) {
    const job = await this.jobRepository.findOneBy({ id: editor.jobId, user: { id: editor.userId } });
    if (!job) throw new JobNotFound();

    await this.jobRepository.update(editor.jobId, {
      title: editor.title,
      companyName: editor.companyName,
      contents: editor.contents,
      address: editor.address,
      fee: editor.fee,
      imageUrl: editor.imageUrl,
    });
  }

  async find(fetcher: JobFetcher): Promise<Job[]> {
    const queryBuilder = this.jobRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.jobMajorCategories', 'jobMajorCategories')
      .leftJoinAndSelect('jobMajorCategories.majorCategory', 'majorCategory');

    if (fetcher.province.length) {
      const provinceSearchKeywords: string[] = [];

      province.forEach(provinceItem => {
        if (fetcher.province.includes(provinceItem.key)) {
          provinceSearchKeywords.push(provinceItem.search);
        }
      });

      const likeConditions = provinceSearchKeywords
        .map((_, index) => {
          return `job.address LIKE :keyword${index}`;
        })
        .join(' OR ');

      const likeParams = provinceSearchKeywords.reduce((params, keyword, index) => {
        params[`keyword${index}`] = `%${keyword}%`;
        return params;
      }, {});

      queryBuilder.andWhere(likeConditions, likeParams);
    }

    if (fetcher.types.length) {
      queryBuilder.andWhere('job.type IN (:...types)', { types: fetcher.types });
    }

    if (fetcher.categoryIds.length) {
      queryBuilder.andWhere('majorCategory.id IN (:...categoryIds)', { categoryIds: fetcher.categoryIds });
    }

    if (fetcher.keyword) {
      queryBuilder.andWhere(
        new Brackets(qb => {
          qb.where('job.title LIKE :keyword', { keyword: `%${fetcher.keyword}%` })
            .orWhere('job.address LIKE :keyword', { keyword: `%${fetcher.keyword}%` })
            .orWhere('job.contents LIKE :keyword', { keyword: `%${fetcher.keyword}%` })
            .orWhere('majorCategory.koName LIKE :keyword', { keyword: `%${fetcher.keyword}%` })
            .orWhere('majorCategory.enName LIKE :keyword', { keyword: `%${fetcher.keyword}%` });
        }),
      );
    }

    return queryBuilder.orderBy('job.createdAt', 'DESC').skip(fetcher.skip).take(fetcher.take).getMany();
  }

  async findOneOrThrowById(id: number): Promise<Job> {
    const job = await this.jobRepository.findOneBy({ id });
    if (!job) throw new JobNotFound();

    return job;
  }

  async count(counter: JobCounter): Promise<number> {
    const queryBuilder = this.jobRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.jobMajorCategories', 'jobMajorCategories')
      .leftJoinAndSelect('jobMajorCategories.majorCategory', 'majorCategory');

    if (counter.types.length) {
      queryBuilder.andWhere('job.type IN (:...types)', { types: counter.types });
    }

    if (counter.categoryIds.length) {
      queryBuilder.andWhere('majorCategory.id IN (:...categoryIds)', { categoryIds: counter.categoryIds });
    }

    if (counter.keyword) {
      queryBuilder.andWhere(
        new Brackets(qb => {
          qb.where('job.title LIKE :keyword', { keyword: `%${counter.keyword}%` })
            .orWhere('job.contents LIKE :keyword', { keyword: `%${counter.keyword}%` })
            .orWhere('majorCategory.koName LIKE :keyword', { keyword: `%${counter.keyword}%` })
            .orWhere('majorCategory.enName LIKE :keyword', { keyword: `%${counter.keyword}%` });
        }),
      );
    }

    return queryBuilder.getCount();
  }

  async deleteOrThrowById(id: number): Promise<void> {
    const job = await this.jobRepository.findOneBy({ id: id });
    if (!job) throw new JobNotFound();

    await job.remove();
  }
}
