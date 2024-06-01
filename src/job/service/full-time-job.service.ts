import { Injectable } from '@nestjs/common';
import { FullTimeJobRepository } from '@/job/repository/full-time-job.repository';
import { GetFullTimeJobsCommand } from '@/job/dto/command/get-full-time-jobs.command';
import { CountFullTimeJobsCommand } from '@/job/dto/command/count-full-time-jobs.command';
import { FullTimeJob } from '@/job/entity/full-time-job.entity';
import { CreateFullTimeJobCommand } from '@/job/dto/command/create-full-time-job.command';
import { MajorCategoryRepository } from '@/job/repository/major-category.repository';
import { EditFullTimeJobCommand } from '@/job/dto/command/edit-full-time-job.command';

@Injectable()
export class FullTimeJobService {
  constructor(
    private readonly fullTimeJobRepository: FullTimeJobRepository,
    private readonly majorCategoryRepository: MajorCategoryRepository,
  ) {}

  async createFullTimeJob(command: CreateFullTimeJobCommand): Promise<number> {
    const createdJobId = await this.fullTimeJobRepository.create(command.toCreator());
    await this.majorCategoryRepository.linkFullTimeJobToMajorCategoriesOrThrow(createdJobId, command.majorIds);

    return createdJobId;
  }

  async editFullTimeJob(command: EditFullTimeJobCommand): Promise<void> {
    await this.fullTimeJobRepository.editOrThrow(command.toEditor());
    await this.majorCategoryRepository.deleteByJobId(command.jobId);
    await this.majorCategoryRepository.linkFullTimeJobToMajorCategoriesOrThrow(command.jobId, command.majorIds);
  }

  async getFullTimeJobs(command: GetFullTimeJobsCommand): Promise<FullTimeJob[]> {
    return this.fullTimeJobRepository.find(command.type, command.categoryIds, command.paging);
  }

  async getFullTimeJob(jobId: number): Promise<FullTimeJob> {
    return this.fullTimeJobRepository.findOneOrThrowById(jobId);
  }

  async countFullTimeJobs(command: CountFullTimeJobsCommand): Promise<number> {
    return this.fullTimeJobRepository.count(command.type, command.categoryIds);
  }

  async deleteFullTimeJob(jobId: number): Promise<void> {
    await this.fullTimeJobRepository.deleteOrThrowById(jobId);
  }
}
