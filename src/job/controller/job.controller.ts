import { RestApiController, RestApiDelete, RestApiGet, RestApiPost, RestApiPut } from '@/common/decorator/rest-api';
import { JobService } from '@/job/service/job.service';
import { JobsResponse } from '@/job/dto/response/jobs.response';
import { Body, Param, Query } from '@nestjs/common';
import { GetJobsRequest } from '@/job/dto/request/get-jobs.request';
import { OkResponse } from '@/common/response/ok.response';
import { CreateResponse } from '@/common/response/createResponse';
import { CreateFullTimeJobRequest } from '@/job/dto/request/create-full-time-job.request';
import { Signature } from '@/common/decorator/signature';
import { UserSignature } from '@/common/type/type';
import { USER_TYPE } from '@/user/entity/user.entity';
import { EditFullTimeJobRequest } from '@/job/dto/request/edit-full-time-job.request';
import { JobResponse } from '@/job/dto/response/job.response';
import { CreatePartTimeJobRequest } from '@/job/dto/request/create-part-time-job.request';
import { CountJobsResponse } from '@/job/dto/response/count-jobs.response';
import { CountJobsCommand } from '@/job/dto/command/count-jobs.command';
import { GetPartTimeJobsRequest } from '@/job/dto/request/get-part-time-jobs.request';
import { EditPartTimeJobRequest } from '@/job/dto/request/edit-part-time-job.request';
import { ApplyPartTimeJobRequest } from '@/job/dto/request/apply-part-time-job.request';
import { GetMyPartTimeJobsRequest } from '@/job/dto/request/get-my-part-time-jobs.request';
import { PartTimeJobsResponse } from '@/job/dto/response/part-time-jobs.response';
import { JobApplicantsResponse } from '@/job/dto/response/job-applicants.response';
import { GetMyApplyJobsRequest } from '@/job/dto/request/get-my-apply-jobs.request';
import { MyApplyJobsResponse } from '@/job/dto/response/my-apply-jobs.response';
import { EditJobStatusRequest } from '@/job/dto/request/edit-job-status.request';

@RestApiController('/jobs', 'Job')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @RestApiGet(JobsResponse, { path: '/', description: '정규직 채용 목록 조회' })
  async getJobs(@Query() request: GetJobsRequest) {
    const pagingItems = await this.jobService.getPagingJobs(request.toGetCommand());

    return new JobsResponse({ jobs: pagingItems.items, totalCount: pagingItems.totalCount });
  }

  @RestApiGet(JobsResponse, { path: '/part-time', description: '단기직 채용 목록 조회' })
  async getPartTimeJobs(@Query() request: GetPartTimeJobsRequest) {
    const pagingItems = await this.jobService.getPartTimeJobs(request.toQuery());

    return new JobsResponse({ jobs: pagingItems.items, totalCount: pagingItems.totalCount });
  }

  @RestApiGet(CountJobsResponse, { path: '/count', description: '채용 개수 조회' })
  async countJobs(): Promise<CountJobsResponse> {
    const command = new CountJobsCommand({
      keyword: null,
      types: [],
      professionalFields: [],
      provinceIds: [],
    });

    const totalCount = await this.jobService.countJobs(command);
    return new CountJobsResponse(totalCount);
  }

  @RestApiGet(JobResponse, { path: '/:jobId', description: '채용 단건 조회' })
  async getJob(@Param('jobId') jobId: number) {
    const job = await this.jobService.getJob(jobId);

    return new JobResponse(job);
  }

  @RestApiDelete(OkResponse, { path: '/:jobId', description: '채용 삭제' })
  async deleteFullTimeJob(@Param('jobId') jobId: number): Promise<OkResponse> {
    await this.jobService.deleteJob(jobId);
    return new OkResponse();
  }

  @RestApiPost(CreateResponse, { path: '/part-time', description: '오브리 구인 생성', auth: [USER_TYPE.CLIENT] })
  async createPartTimeJob(@Signature() signature: UserSignature, @Body() request: CreatePartTimeJobRequest): Promise<CreateResponse> {
    const jobId = await this.jobService.createPartTimeJob(request.toCommand(signature.id));

    return new CreateResponse(jobId);
  }

  @RestApiPost(CreateResponse, { path: '/full-time', description: '채용 생성', auth: [USER_TYPE.CLIENT] })
  async createFullTimeJob(@Signature() signature: UserSignature, @Body() request: CreateFullTimeJobRequest): Promise<CreateResponse> {
    const jobId = await this.jobService.createJob(request.toCommand(signature.id));

    return new CreateResponse(jobId);
  }

  @RestApiPut(OkResponse, { path: '/full-time/:jobId', description: '정규직 채용 수정', auth: [USER_TYPE.CLIENT] })
  async editFullTimeJob(@Signature() signature: UserSignature, @Param('jobId') jobId: number, @Body() request: EditFullTimeJobRequest): Promise<OkResponse> {
    await this.jobService.editJob(request.toCommand(signature.id, jobId));

    return new OkResponse();
  }

  @RestApiPut(OkResponse, { path: '/part-time/:jobId', description: '단기직 채용 수정', auth: [USER_TYPE.CLIENT] })
  async editPartTimeJob(@Signature() signature: UserSignature, @Param('jobId') jobId: number, @Body() request: EditPartTimeJobRequest): Promise<OkResponse> {
    await this.jobService.editJob(request.toCommand(signature.id, jobId));

    return new OkResponse();
  }

  @RestApiPost(CreateResponse, { path: '/part-time/:jobId/apply', description: '단기직 지원 신청', auth: [USER_TYPE.CLIENT] })
  async applyPartTimeJob(
    @Signature() signature: UserSignature,
    @Param('jobId') jobId: number,
    @Body() request: ApplyPartTimeJobRequest,
  ): Promise<CreateResponse> {
    return new CreateResponse(await this.jobService.applyPartTimeJob(signature.id, jobId, request.profile));
  }

  @RestApiGet(PartTimeJobsResponse, { path: '/my/part-time', description: '내 활동 조회(내 연주)', auth: [USER_TYPE.CLIENT] })
  async getMyPartTimeJob(@Signature() signature: UserSignature, @Query() request: GetMyPartTimeJobsRequest) {
    const pagingJobs = await this.jobService.getMyPartTimeJobs(signature.id, { page: request.page, size: request.size });

    return new PartTimeJobsResponse({ jobs: pagingJobs.items, totalCount: pagingJobs.totalCount });
  }

  @RestApiGet(JobApplicantsResponse, { path: '/:jobId/applicants', description: '연주 지원자 조회', auth: [USER_TYPE.CLIENT] })
  async getJobApplicants(@Signature() signature: UserSignature, @Param('jobId') jobId: number) {
    const jobUsers = await this.jobService.getJobApplicants(signature.id, jobId);

    return new JobApplicantsResponse(jobUsers);
  }

  @RestApiGet(MyApplyJobsResponse, { path: '/my/apply', description: '연주 지원 목록 조회', auth: [USER_TYPE.CLIENT] })
  async getMyApplyJobs(@Signature() signature: UserSignature, @Query() request: GetMyApplyJobsRequest) {
    const pagingJobs = await this.jobService.getMyApplyJobs(signature.id, { page: request.page, size: request.size });

    return new MyApplyJobsResponse({ jobUsers: pagingJobs.items, totalCount: pagingJobs.totalCount });
  }

  @RestApiPut(OkResponse, { path: '/:jobId/status', description: '연주 상태 수정', auth: [USER_TYPE.CLIENT] })
  async updateJobStatus(@Signature() signature: UserSignature, @Param('jobId') jobId: number, @Body() request: EditJobStatusRequest) {
    await this.jobService.updateJobStatus(signature.id, jobId, request.isActive);
  }
}
