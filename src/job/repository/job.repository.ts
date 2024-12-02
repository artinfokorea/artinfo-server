import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, In, Repository } from 'typeorm';
import { Job, JOB_TYPE } from '@/job/entity/job.entity';
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
import { JobSchedule } from '@/job/entity/job-schedule.entity';
import { PartTimeJobFetcher } from '@/job/repository/operation/part-time-job.fetcher';
import { Paging, PagingItems } from '@/common/type/type';
import { JobScheduleCreator } from '@/job/repository/operation/job-schedule.creator';
import { JobUser } from '@/job/entity/job-user.entity';

@Injectable()
export class JobRepository {
  constructor(
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,

    @InjectRepository(JobUser)
    private jobUserRepository: Repository<JobUser>,

    @InjectRepository(JobSchedule)
    private jobScheduleRepository: Repository<JobSchedule>,

    @InjectRepository(Province)
    private provinceRepository: Repository<Province>,

    private readonly redisService: RedisRepository,
    private eventEmitter: EventEmitter2,
    private readonly dataSource: DataSource,
  ) {}

  async findJobUserByUserIdAndJobId(userId: number, jobId: number) {
    return this.jobUserRepository.findOneBy({ userId, jobId });
  }

  async createJobUser(userId: number, jobId: number, profile: string): Promise<number> {
    return this.jobUserRepository.save({ userId: userId, jobId: jobId, profile: profile }).then(jobUser => jobUser.id);
  }

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
          recruitSiteUrl: creator.recruitSiteUrl,
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

        if (creator.schedules.length) {
          const scheduleCreators = creator.schedules.map(schedule => {
            return transactionManager.create(JobSchedule, {
              job: job,
              startAt: schedule.startAt,
              endAt: schedule.endAt,
            });
          });

          await transactionManager.save(scheduleCreators);
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
        recruitSiteUrl: editor.recruitSiteUrl,
        imageUrl: editor.imageUrl,
        isActive: editor.isActive,
      });

      await this.redisService.deleteByPattern('jobs:*');
    });
  }

  async findPartTimeJobs(fetcher: PartTimeJobFetcher): Promise<PagingItems<Job>> {
    const redisKey = new Util().getRedisKey('jobs:list:part-time', fetcher);

    const redisJobs = await this.redisService.getByKey(redisKey);
    if (redisJobs) {
      return redisJobs as PagingItems<Job>;
    } else {
      const jobIdsQueryBuilder = this.jobRepository
        .createQueryBuilder('job')
        .select('job.id')
        .leftJoin('job.jobProvinces', 'jobProvinces')
        .leftJoin('job.jobMajorCategories', 'jobMajorCategories')
        .leftJoin('jobMajorCategories.majorCategory', 'majorCategory')
        .where('job.type = :type', { type: JOB_TYPE.PART_TIME });

      if (fetcher.provinceIds.length) {
        const provinces = await this.provinceRepository.findBy({ id: In(fetcher.provinceIds) });
        jobIdsQueryBuilder.andWhere('jobProvinces.provinceId IN (:...provinceIds)', { provinceIds: provinces.map(province => province.id) });
      }

      if (fetcher.majorGroup.length) {
        jobIdsQueryBuilder.andWhere('majorCategory.thirdGroupEn IN (:...majorGroup)', { majorGroup: fetcher.majorGroup });
      }

      if (fetcher.keyword) {
        jobIdsQueryBuilder.andWhere(
          new Brackets(qb => {
            qb.where('LOWER(job.title) LIKE LOWER(:keyword)', { keyword: `%${fetcher.keyword}%` })
              .orWhere('LOWER(job.companyName) LIKE LOWER(:keyword)', { keyword: `%${fetcher.keyword}%` })
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
        return { items: [], totalCount: 0 };
      }

      const queryBuilder = this.jobRepository
        .createQueryBuilder('job')
        .leftJoinAndSelect('job.user', 'user')
        .leftJoinAndSelect('job.jobMajorCategories', 'jobMajorCategories')
        .leftJoinAndSelect('job.jobProvinces', 'jobProvinces')
        .leftJoinAndSelect('jobMajorCategories.majorCategory', 'majorCategory')
        .whereInIds(jobIds.map(job => job.id));

      const [jobs, totalCount] = await queryBuilder
        .orderBy('job.isActive', 'DESC')
        .addOrderBy('job.createdAt', 'DESC')
        .skip(fetcher.skip)
        .take(fetcher.take)
        .getManyAndCount();

      const allSchedules = await this.jobScheduleRepository.find({
        where: { job: { id: In(jobs.map(job => job.id)) } },
        order: { startAt: 'ASC', endAt: 'ASC' },
      });

      const scheduleMap = allSchedules.reduce((map, schedule) => {
        if (!map[schedule.jobId]) {
          map[schedule.jobId] = [];
        }
        map[schedule.jobId].push(schedule);
        return map;
      }, {});

      for (const job of jobs) {
        job.schedules = scheduleMap[job.id] || [];
      }

      const pagingJobs = { items: jobs, totalCount: totalCount };
      this.eventEmitter.emit('jobs.fetched', redisKey, pagingJobs);

      return pagingJobs;
    }
  }

  async findFullTimeJobs(fetcher: JobFetcher): Promise<PagingItems<Job>> {
    const redisKey = new Util().getRedisKey(`jobs:list:full-time:${fetcher.types.join(':')}:`, fetcher).toLowerCase();

    const redisJobs = await this.redisService.getByKey(redisKey);
    if (redisJobs) {
      return redisJobs as PagingItems<Job>;
    } else {
      const jobIdsQueryBuilder = this.jobRepository
        .createQueryBuilder('job')
        .select('job.id')
        .leftJoin('job.jobProvinces', 'jobProvinces')
        .leftJoin('job.jobMajorCategories', 'jobMajorCategories')
        .leftJoin('jobMajorCategories.majorCategory', 'majorCategory')
        .where('job.type != :type', { type: JOB_TYPE.PART_TIME });

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

      if (fetcher.majorGroups.length) {
        jobIdsQueryBuilder.andWhere('majorCategory.thirdGroupEn IN (:...majorGroup)', { majorGroup: fetcher.majorGroups });
      }

      const jobIds = await jobIdsQueryBuilder.getMany();

      if (!jobIds.length) {
        this.eventEmitter.emit('jobs.fetched', redisKey, { items: [], totalCount: 0 });
        return { items: [], totalCount: 0 };
      }

      const queryBuilder = this.jobRepository
        .createQueryBuilder('job')
        .leftJoinAndSelect('job.user', 'user')
        .leftJoinAndSelect('job.jobMajorCategories', 'jobMajorCategories')
        .leftJoinAndSelect('job.jobProvinces', 'jobProvinces')
        .leftJoinAndSelect('jobMajorCategories.majorCategory', 'majorCategory')
        .whereInIds(jobIds.map(job => job.id));

      const [jobs, totalCount] = await queryBuilder.orderBy('job.createdAt', 'DESC').skip(fetcher.skip).take(fetcher.take).getManyAndCount();
      const pagingResult = { items: jobs, totalCount: totalCount };

      this.eventEmitter.emit('jobs.fetched', redisKey, pagingResult);

      return pagingResult;
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

  async findOnePartTimeJobOrThrowById(id: number): Promise<Job> {
    const job = await this.jobRepository.findOne({ relations: ['user', 'jobUsers.user.userMajorCategories.majorCategory'], where: { id } });
    if (!job) throw new JobNotFound();
    return job;
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

  async deleteJobSchedulesByJobId(id: number): Promise<void> {
    await this.jobScheduleRepository.delete({ job: { id: id } });
  }

  async createJobSchedulesOrThrow(creator: JobScheduleCreator) {
    const job = await this.jobRepository.findOneBy({ id: creator.jobId });
    if (!job) throw new JobNotFound();

    await this.jobScheduleRepository.save(
      creator.schedules.map(creator => {
        return {
          job: job,
          startAt: creator.startAt,
          endAt: creator.endAt,
        };
      }),
    );
  }

  async findMyPartTimeJobs(userId: number, paging: Paging): Promise<PagingItems<Job>> {
    const [jobs, totalCount] = await this.jobRepository
      .createQueryBuilder('job')
      .where('job.user_id = :userId AND job.type = :type', { userId: userId, type: JOB_TYPE.PART_TIME })
      .orderBy('job.createdAt', 'DESC')
      .skip((paging.page - 1) * paging.size)
      .take(paging.size)
      .getManyAndCount();

    return { items: jobs, totalCount: totalCount };
  }

  async findJobUsersByUserId(userId: number, paging: Paging) {
    const [jobUsers, totalCount] = await this.jobUserRepository
      .createQueryBuilder('jobUser')
      .leftJoinAndSelect('jobUser.job', 'job')
      .where('jobUser.user_id = :userId', { userId: userId })
      .orderBy('jobUser.createdAt', 'DESC')
      .skip((paging.page - 1) * paging.size)
      .take(paging.size)
      .getManyAndCount();

    return { items: jobUsers, totalCount: totalCount };
  }

  async updateJobStatusOrThrow(userId: number, jobId: number, isActive: boolean) {
    const job = await this.jobRepository.findOneBy({ id: jobId, user: { id: userId } });
    if (!job) throw new JobNotFound();

    await this.jobRepository.update({ id: jobId, user: { id: userId } }, { isActive: isActive });
    await this.redisService.deleteByPattern('jobs:*');
  }
}
