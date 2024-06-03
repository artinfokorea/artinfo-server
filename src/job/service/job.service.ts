import { Injectable } from '@nestjs/common';
import { GetFullTimeJobsCommand } from '@/job/dto/command/get-full-time-jobs.command';
import { CountFullTimeJobsCommand } from '@/job/dto/command/count-full-time-jobs.command';
import { Job } from '@/job/entity/job.entity';
import { CreateFullTimeJobCommand } from '@/job/dto/command/create-full-time-job.command';
import { MajorCategoryRepository } from '@/job/repository/major-category.repository';
import { EditFullTimeJobCommand } from '@/job/dto/command/edit-full-time-job.command';
import { JobRepository } from '@/job/repository/job.repository';
import { JobFetcher } from '@/job/repository/operation/job.fetcher';
import { JobCounter } from '@/job/repository/operation/job.counter';

@Injectable()
export class JobService {
  constructor(
    private readonly jobRepository: JobRepository,
    private readonly majorCategoryRepository: MajorCategoryRepository,
  ) {}

  async createJob(command: CreateFullTimeJobCommand): Promise<number> {
    const createdJobId = await this.jobRepository.create(command.toCreator());
    await this.majorCategoryRepository.linkFullTimeJobToMajorCategoriesOrThrow(createdJobId, command.majorIds);

    return createdJobId;
  }

  async editJob(command: EditFullTimeJobCommand): Promise<void> {
    await this.jobRepository.editOrThrow(command.toEditor());
    await this.majorCategoryRepository.deleteByJobId(command.jobId);
    await this.majorCategoryRepository.linkFullTimeJobToMajorCategoriesOrThrow(command.jobId, command.majorIds);
  }

  async getJobs(command: GetFullTimeJobsCommand): Promise<Job[]> {
    const fetcher = new JobFetcher({ keyword: command.keyword, categoryIds: command.categoryIds, types: command.types, paging: command.paging });
    return this.jobRepository.find(fetcher);
  }

  async getJob(jobId: number): Promise<Job> {
    return this.jobRepository.findOneOrThrowById(jobId);
  }

  async countJobs(command: CountFullTimeJobsCommand): Promise<number> {
    const counter = new JobCounter({ keyword: command.keyword, categoryIds: command.categoryIds, types: command.types });
    return this.jobRepository.count(counter);
  }

  async deleteJob(jobId: number): Promise<void> {
    await this.jobRepository.deleteOrThrowById(jobId);
  }
}
