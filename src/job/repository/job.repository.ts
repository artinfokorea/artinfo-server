import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, In, Repository } from 'typeorm';
import { Job } from '@/job/entity/job.entity';
import { JobCreationFailed, JobNotFound } from '@/job/exception/job.exception';
import { JobCreator } from '@/job/repository/operation/job.creator';
import { JobEditor } from '@/job/repository/operation/job.editor';
import { JobFetcher } from '@/job/repository/operation/job.fetcher';
import { JobCounter } from '@/job/repository/operation/job.counter';
import { Province } from '@/lesson/entity/province.entity';
import { JobProvince } from '@/job/entity/job-province.entity';

@Injectable()
export class JobRepository {
  constructor(
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,

    @InjectRepository(Province)
    private provinceRepository: Repository<Province>,

    private readonly dataSource: DataSource,
  ) {}

  async create(creator: JobCreator): Promise<number> {
    try {
      return this.dataSource.transaction(async transactionManager => {
        const job = await transactionManager.save(Job, {
          user: { id: creator.userId },
          type: creator.type,
          title: creator.title,
          companyName: creator.companyName,
          contents: creator.contents,
          address: creator.address,
          fee: creator.fee,
          imageUrl: creator.imageUrl,
        });

        if (creator.address) {
          const provinceName = creator.address.split(' ')[0];
          const province = await transactionManager.findOneBy(Province, { name: provinceName });
          console.log(province);
          if (province) {
            await transactionManager.save(JobProvince, {
              jobId: job.id,
              provinceId: province.id,
            });
          }
        }

        return job.id;
      });
    } catch (e) {
      console.log(e);
      throw new JobCreationFailed();
    }
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
      .leftJoinAndSelect('job.jobProvinces', 'jobProvinces')
      .leftJoinAndSelect('jobMajorCategories.majorCategory', 'majorCategory');

    if (fetcher.provinceIds.length) {
      const provinces = await this.provinceRepository.findBy({ id: In(fetcher.provinceIds) });
      queryBuilder.andWhere('jobProvinces.provinceId IN (:...provinceIds)', { provinceIds: provinces.map(province => province.id) });
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
            .orWhere('majorCategory.koName LIKE :keyword', { keyword: `%${fetcher.keyword}%` });
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
      .leftJoinAndSelect('job.jobProvinces', 'jobProvinces')
      .leftJoinAndSelect('jobMajorCategories.majorCategory', 'majorCategory');

    if (counter.provinceIds.length) {
      const provinces = await this.provinceRepository.findBy({ id: In(counter.provinceIds) });
      queryBuilder.andWhere('jobProvinces.provinceId IN (:...provinceIds)', { provinceIds: provinces.map(province => province.id) });
    }

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
            .orWhere('majorCategory.koName LIKE :keyword', { keyword: `%${counter.keyword}%` });
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
