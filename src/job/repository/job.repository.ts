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
import { RedisRepository } from '@/common/redis/redis-repository.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Util } from '@/common/util/util';

@Injectable()
export class JobRepository {
  constructor(
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,

    @InjectRepository(Province)
    private provinceRepository: Repository<Province>,

    private readonly redisService: RedisRepository,
    private eventEmitter: EventEmitter2,
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
          addressDetail: creator.addressDetail,
          fee: creator.fee,
          imageUrl: creator.imageUrl,
        });

        if (creator.address) {
          const provinceName = creator.address.split(' ')[0];
          const province = await transactionManager.findOneBy(Province, { name: provinceName });

          if (province) {
            await transactionManager.save(JobProvince, {
              jobId: job.id,
              provinceId: province.id,
            });
          }
        }

        await this.redisService.deleteByPattern('jobs:*');
        return job.id;
      });
    } catch (e) {
      console.log(e);
      throw new JobCreationFailed();
    }
  }

  async editOrThrow(editor: JobEditor) {
    return this.dataSource.transaction(async transactionManager => {
      const job = await transactionManager.findOneBy(Job, { id: editor.jobId, user: { id: editor.userId } });
      if (!job) throw new JobNotFound();

      if (editor.address) {
        await transactionManager.delete(JobProvince, { jobId: job.id });

        const provinceName = editor.address.split(' ')[0];
        const province = await transactionManager.findOneBy(Province, { name: provinceName });

        if (province) {
          await transactionManager.save(JobProvince, {
            jobId: job.id,
            provinceId: province.id,
          });
        }
      }

      await transactionManager.update(Job, editor.jobId, {
        title: editor.title,
        companyName: editor.companyName,
        contents: editor.contents,
        address: editor.address,
        addressDetail: editor.addressDetail,
        fee: editor.fee,
        imageUrl: editor.imageUrl,
      });

      await this.redisService.deleteByPattern('jobs:*');
    });
  }

  async find(fetcher: JobFetcher): Promise<Job[]> {
    const redisKey = new Util().getRedisKey('jobs:list:', fetcher);

    const redisJobs = await this.redisService.getByKey(redisKey);
    if (redisJobs) {
      return redisJobs as Job[];
    } else {
      const jobIdsQueryBuilder = this.jobRepository
        .createQueryBuilder('job')
        .select('job.id')
        .leftJoin('job.jobProvinces', 'jobProvinces')
        .leftJoin('job.jobMajorCategories', 'jobMajorCategories')
        .leftJoin('jobMajorCategories.majorCategory', 'majorCategory');

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
  }

  async findOneOrThrowById(id: number): Promise<Job> {
    const redisKey = new Util().getRedisKey('jobs:single:', id);
    const job = await this.redisService.getByKey(redisKey);

    if (job) {
      return job as Job;
    } else {
      const job = await this.jobRepository.findOne({ relations: ['user'], where: { id } });
      if (!job) throw new JobNotFound();

      this.eventEmitter.emit('job.fetched', redisKey, job);
      return job;
    }
  }

  async count(counter: JobCounter): Promise<number> {
    const redisKey = new Util().getRedisKey('jobs:count:', counter);
    const redisTotalCount = await this.redisService.getByKey(redisKey);

    if (redisTotalCount !== null) {
      return redisTotalCount as number;
    } else {
      const queryBuilder = this.jobRepository
        .createQueryBuilder('job')
        .leftJoinAndSelect('job.jobMajorCategories', 'jobMajorCategories')
        .leftJoinAndSelect('job.jobProvinces', 'jobProvinces')
        .leftJoinAndSelect('jobMajorCategories.majorCategory', 'majorCategory');

      if (counter.provinceIds.length) {
        const provinces = await this.provinceRepository.findBy({ id: In(counter.provinceIds) });
        queryBuilder.andWhere('jobProvinces.provinceId IN (:...provinceIds)', { provinceIds: provinces.map(province => province.id) });
      }

      if (counter.provinceIds.length) {
        const provinces = await this.provinceRepository.findBy({ id: In(counter.provinceIds) });
        queryBuilder.andWhere('jobProvinces.provinceId IN (:...provinceIds)', { provinceIds: provinces.map(province => province.id) });
      }

      if (counter.types.length) {
        queryBuilder.andWhere('job.type IN (:...types)', { types: counter.types });
      }

      if (counter.professionalFields.length) {
        queryBuilder.andWhere('majorCategory.secondGroupEn IN (:...professionalFields)', { professionalFields: counter.professionalFields });
      }

      if (counter.keyword) {
        queryBuilder.andWhere(
          new Brackets(qb => {
            qb.where('LOWER(job.title) LIKE LOWER(:keyword)', { keyword: `%${counter.keyword}%` })
              .orWhere('LOWER(job.address) LIKE LOWER(:keyword)', { keyword: `%${counter.keyword}%` })
              .orWhere('LOWER(job.contents) LIKE LOWER(:keyword)', { keyword: `%${counter.keyword}%` })
              .orWhere('LOWER(majorCategory.koName) LIKE LOWER(:keyword)', { keyword: `%${counter.keyword}%` })
              .orWhere('LOWER(majorCategory.enName) LIKE LOWER(:keyword)', { keyword: `%${counter.keyword}%` });
          }),
        );
      }

      const totalCount = await queryBuilder.getCount();
      this.eventEmitter.emit('jobs-count.fetched', redisKey, totalCount);

      return totalCount;
    }
  }

  async deleteOrThrowById(id: number): Promise<void> {
    const job = await this.jobRepository.findOneBy({ id: id });
    if (!job) throw new JobNotFound();

    await job.remove();
    await this.redisService.deleteByPattern('jobs:*');
  }
}
