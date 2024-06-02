import { Injectable } from '@nestjs/common';
import { GetFullTimeJobsCommand } from '@/job/dto/command/get-full-time-jobs.command';
import { CountFullTimeJobsCommand } from '@/job/dto/command/count-full-time-jobs.command';
import { Job } from '@/job/entity/job.entity';
import { CreateFullTimeJobCommand } from '@/job/dto/command/create-full-time-job.command';
import { MajorCategoryRepository } from '@/job/repository/major-category.repository';
import { EditFullTimeJobCommand } from '@/job/dto/command/edit-full-time-job.command';
import { JobRepository } from '@/job/repository/job-repository.service';

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
    return this.jobRepository.find(command.types, command.categoryIds, command.paging);
  }

  async getJob(jobId: number): Promise<Job> {
    return this.jobRepository.findOneOrThrowById(jobId);
  }

  async countJobs(command: CountFullTimeJobsCommand): Promise<number> {
    return this.jobRepository.count(command.types, command.categoryIds);
  }

  async deleteJob(jobId: number): Promise<void> {
    await this.jobRepository.deleteOrThrowById(jobId);
  }
}
