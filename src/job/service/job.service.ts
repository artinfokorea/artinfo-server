import { Injectable } from '@nestjs/common';
import { GetJobsCommand } from '@/job/dto/command/get-jobs.command';
import { CountJobsCommand } from '@/job/dto/command/count-jobs.command';
import { Job } from '@/job/entity/job.entity';
import { CreateJobCommand } from '@/job/dto/command/create-job.command';
import { MajorRepository } from '@/major/repository/major.repository';
import { EditJobCommand } from '@/job/dto/command/edit-job.command';
import { JobRepository } from '@/job/repository/job.repository';
import { JobFetcher } from '@/job/repository/operation/job.fetcher';
import { JobCounter } from '@/job/repository/operation/job.counter';
import { PagingItems } from '@/common/type/type';
import { CreatePartTimeJobCommand } from '@/job/dto/command/create-part-time-job.command';
import { PartTimeJobScheduleRequired, PartTimeJobUserPhoneRequired } from '@/job/exception/job.exception';
import { GetPartTimeJobsQuery } from '@/job/dto/query/get-part-time-jobs.query';
import { PartTimeJobFetcher } from '@/job/repository/operation/part-time-job.fetcher';
import { UserRepository } from '@/user/repository/user.repository';
import { UserNotFound } from '@/user/exception/user.exception';

@Injectable()
export class JobService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jobRepository: JobRepository,
    private readonly majorCategoryRepository: MajorRepository,
  ) {}

  async createJob(command: CreateJobCommand): Promise<number> {
    const createdJobId = await this.jobRepository.create(command.toCreator());
    await this.majorCategoryRepository.createJobMajorCategoriesOrThrow(createdJobId, command.majorIds);

    return createdJobId;
  }

  async createPartTimeJob(command: CreatePartTimeJobCommand): Promise<number> {
    if (!command.schedules.length) throw new PartTimeJobScheduleRequired();

    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new UserNotFound();
    } else if (!user.phone) {
      throw new PartTimeJobUserPhoneRequired();
    }

    const createdJobId = await this.jobRepository.create(command.toCreator());
    await this.majorCategoryRepository.createJobMajorCategoriesOrThrow(createdJobId, command.majorIds);

    return createdJobId;
  }

  async editJob(command: EditJobCommand): Promise<void> {
    await this.jobRepository.editOrThrow(command.toEditor());
    await this.majorCategoryRepository.deleteByJobId(command.jobId);
    await this.majorCategoryRepository.createJobMajorCategoriesOrThrow(command.jobId, command.majorIds);
    await this.jobRepository.deleteJobSchedulesByJobId(command.jobId);
    await this.jobRepository.createJobSchedulesOrThrow({ jobId: command.jobId, schedules: command.schedules });
  }

  async getPartTimeJobs(query: GetPartTimeJobsQuery): Promise<PagingItems<Job>> {
    const fetcher = new PartTimeJobFetcher({
      keyword: query.keyword,
      majorGroup: query.majorGroups,
      paging: query.paging,
      provinceIds: query.provinceIds,
    });

    return this.jobRepository.findPartTimeJobs(fetcher);
  }

  async getPagingJobs(command: GetJobsCommand): Promise<PagingItems<Job>> {
    const fetcher = new JobFetcher({
      keyword: command.keyword,
      types: command.types,
      professionalFields: command.professionalFields,
      paging: command.paging,
      provinceIds: command.provinceIds,
    });
    const jobs = await this.jobRepository.findFullTimeJobs(fetcher);

    const counter = new JobCounter({
      keyword: command.keyword,
      professionalFields: command.professionalFields,
      types: command.types,
      provinceIds: command.provinceIds,
    });
    const totalCount = await this.jobRepository.count(counter);

    return { items: jobs, totalCount: totalCount };
  }

  async getJob(jobId: number): Promise<Job> {
    return this.jobRepository.findOneOrThrowById(jobId);
  }

  async countJobs(command: CountJobsCommand): Promise<number> {
    const counter = new JobCounter({
      keyword: command.keyword,
      professionalFields: command.professionalFields,
      types: command.types,
      provinceIds: command.provinceIds,
    });
    return this.jobRepository.count(counter);
  }

  async deleteJob(jobId: number): Promise<void> {
    await this.jobRepository.deleteOrThrowById(jobId);
  }
}
