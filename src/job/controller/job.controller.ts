import { RestApiController, RestApiDelete, RestApiGet, RestApiPost, RestApiPut } from '@/common/decorator/rest-api';
import { JobService } from '@/job/service/job.service';
import { JobsResponse } from '@/job/dto/response/jobs.response';
import { Body, Param, Query } from '@nestjs/common';
import { GetJobsRequest } from '@/job/dto/request/get-jobs.request';
import { OkResponse } from '@/common/response/ok.response';
import { CreatedResponse } from '@/common/response/created.response';
import { CreateFullTimeJobRequest } from '@/job/dto/request/create-full-time-job.request';
import { Signature } from '@/common/decorator/signature';
import { UserSignature } from '@/common/type/type';
import { USER_TYPE } from '@/user/entity/user.entity';
import { CreateJobReligionRequest } from '@/job/dto/request/create-job-religion.request';
import { EditJobArtOrganizationRequest } from '@/job/dto/request/edit-job-art-organization.request';
import { EditJobReligionRequest } from '@/job/dto/request/edit-job-religion.request';
import { JobResponse } from '@/job/dto/response/job.response';
import { CreatePartTimeJobRequest } from '@/job/dto/request/create-part-time-job.request';

@RestApiController('/jobs', 'Job')
export class JobController {
  constructor(private readonly fullTimeJobService: JobService) {}

  @RestApiGet(JobsResponse, { path: '/', description: '채용 목록 조회' })
  async getJobs(@Query() request: GetJobsRequest) {
    const jobs = await this.fullTimeJobService.getJobs(request.toGetCommand());
    const totalCount = await this.fullTimeJobService.countJobs(request.toCountCommand());

    return new JobsResponse({ jobs: jobs, totalCount: totalCount });
  }

  @RestApiGet(JobResponse, { path: '/:jobId', description: '채용 단건 조회' })
  async getFullTimeJob(@Param('jobId') jobId: number) {
    const job = await this.fullTimeJobService.getJob(jobId);

    return new JobResponse(job);
  }

  @RestApiDelete(OkResponse, { path: '/:jobId', description: '정규직 채용 삭제' })
  async deleteFullTimeJob(@Param('jobId') jobId: number): Promise<OkResponse> {
    await this.fullTimeJobService.deleteJob(jobId);
    return new OkResponse();
  }

  @RestApiPost(CreatedResponse, { path: '/part-time', description: '오브리 채용 생성', auth: [USER_TYPE.CLIENT] })
  async createPartTimeJob(@Signature() signature: UserSignature, @Body() request: CreatePartTimeJobRequest): Promise<CreatedResponse> {
    const jobId = await this.fullTimeJobService.createJob(request.toCommand(signature.id));

    return new CreatedResponse(jobId);
  }

  @RestApiPost(CreatedResponse, { path: '/full-time', description: '(예술 단체 / 강사 ) 채용 생성', auth: [USER_TYPE.CLIENT] })
  async createFullTimeJob(@Signature() signature: UserSignature, @Body() request: CreateFullTimeJobRequest): Promise<CreatedResponse> {
    const jobId = await this.fullTimeJobService.createJob(request.toCommand(signature.id));

    return new CreatedResponse(jobId);
  }

  @RestApiPut(OkResponse, { path: '/art-organization/:jobId', description: '예술 단체 채용 수정', auth: [USER_TYPE.CLIENT] })
  async editFullTimeJobArtOrganization(@Signature() signature: UserSignature, @Body() request: EditJobArtOrganizationRequest): Promise<OkResponse> {
    await this.fullTimeJobService.editJob(request.toCommand(signature.id));

    return new OkResponse();
  }

  @RestApiPost(CreatedResponse, { path: '/religion', description: '종교 채용 생성', auth: [USER_TYPE.CLIENT] })
  async createFullTimeJobReligion(@Signature() signature: UserSignature, @Body() request: CreateJobReligionRequest): Promise<CreatedResponse> {
    const jobId = await this.fullTimeJobService.createJob(request.toCommand(signature.id));

    return new CreatedResponse(jobId);
  }

  @RestApiPut(OkResponse, { path: '/religion/:jobId', description: '종교 채용 수정', auth: [USER_TYPE.CLIENT] })
  async editFullTimeJobReligion(@Signature() signature: UserSignature, @Body() request: EditJobReligionRequest): Promise<OkResponse> {
    await this.fullTimeJobService.editJob(request.toCommand(signature.id));

    return new OkResponse();
  }
}
