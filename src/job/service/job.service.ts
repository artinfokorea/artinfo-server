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
import { Paging, PagingItems } from '@/common/type/type';
import { CreatePartTimeJobCommand } from '@/job/dto/command/create-part-time-job.command';
import {
  AlreadyAppliedJob,
  JobApplicantsNotAllowed,
  JobNotFound,
  OwnJobApplicationNotAllowed,
  PartTimeJobScheduleRequired,
  PartTimeJobUserPhoneRequired,
} from '@/job/exception/job.exception';
import { GetPartTimeJobsQuery } from '@/job/dto/query/get-part-time-jobs.query';
import { PartTimeJobFetcher } from '@/job/repository/operation/part-time-job.fetcher';
import { UserRepository } from '@/user/repository/user.repository';
import { UserNotFound, UserPhoneNotFound } from '@/user/exception/user.exception';
import { UserDoesNotQualify } from '@/lesson/lesson.exception';
import { SystemService } from '@/system/service/system.service';
import { JobUser } from '@/job/entity/job-user.entity';

@Injectable()
export class JobService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jobRepository: JobRepository,
    private readonly majorCategoryRepository: MajorRepository,
    private readonly systemService: SystemService,
  ) {}

  async applyPartTimeJob(applierId: number, jobId: number, profile: string): Promise<number> {
    const user = await this.userRepository.findById(applierId);
    if (!user) throw new UserNotFound();

    const job = await this.jobRepository.findOneOrThrowById(jobId);
    if (!job) {
      throw new JobNotFound();
    } else if (!job.user.phone) {
      throw new UserPhoneNotFound();
    }
    const jobUser = await this.jobRepository.findJobUserByUserIdAndJobId(applierId, jobId);
    if (jobUser) throw new AlreadyAppliedJob();
    if (applierId === job.user.id) throw new OwnJobApplicationNotAllowed();

    const cases: string[] = [];
    if (!user.userMajorCategories.length) cases.push('전공');
    if (!user.schools.length) cases.push('학력');
    if (!user.phone) cases.push('연락처');
    if (!user?.phone) throw new UserDoesNotQualify(cases);

    await this.systemService.sendApplyJobAlarmSMS(job.user.phone);

    return await this.jobRepository.createJobUser(applierId, jobId, profile);
  }

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

  async getMyPartTimeJobs(userId: number, paging: Paging) {
    return this.jobRepository.findMyPartTimeJobs(userId, paging);
  }

  async getMyApplyJobs(userId: number, paging: Paging) {
    return this.jobRepository.findJobUsersByUserId(userId, paging);
  }

  async getJobApplicants(authorId: number, jobId: number): Promise<JobUser[]> {
    const job = await this.jobRepository.findOnePartTimeJobOrThrowById(jobId);
    if (job.user.id !== authorId) throw new JobApplicantsNotAllowed();

    return job.jobUsers;
  }
}
