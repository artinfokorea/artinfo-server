import { Injectable } from '@nestjs/common';
import { FullTimeJobRepository } from '@/job/repository/full-time-job.repository';
import { GetFullTimeJobsCommand } from '@/job/dto/command/get-full-time-jobs.command';
import { CountFullTimeJobsCommand } from '@/job/dto/command/count-full-time-jobs.command';
import { FullTimeJob } from '@/job/entity/full-time-job.entity';

@Injectable()
export class FullTimeJobService {
  constructor(private readonly fullTimeJobRepository: FullTimeJobRepository) {}

  async getFullTimeJobs(command: GetFullTimeJobsCommand): Promise<FullTimeJob[]> {
    return this.fullTimeJobRepository.findBy(command.type, command.categoryIds, command.paging);
  }

  async getFullTimeJob(jobId: number): Promise<FullTimeJob> {
    return this.fullTimeJobRepository.findOneOrThrowById(jobId);
  }

  async countFullTimeJobs(command: CountFullTimeJobsCommand): Promise<number> {
    return this.fullTimeJobRepository.countBy(command.type, command.categoryIds);
  }
}
