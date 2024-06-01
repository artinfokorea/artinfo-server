import { RestApiController, RestApiDelete, RestApiGet, RestApiPost, RestApiPut } from '@/common/decorator/rest-api';
import { FullTimeJobService } from '@/job/service/full-time-job.service';
import { FullTimeJobsResponse } from '@/job/dto/response/full-time-jobs.response';
import { Body, Param, Query } from '@nestjs/common';
import { GetFullTimeJobsRequest } from '@/job/dto/request/get-full-time-jobs.request';
import { FullTimeJobDetailResponse } from '@/job/dto/response/full-time-job-detail.response';
import { OkResponse } from '@/common/response/ok.response';
import { CreatedResponse } from '@/common/response/created.response';
import { CreateFullTimeJobArtOrganizationRequest } from '@/job/dto/request/create-full-time-job-art-organization.request';
import { Signature } from '@/common/decorator/signature';
import { UserSignature } from '@/common/type/type';
import { USER_TYPE } from '@/user/entity/user.entity';
import { CreateFullTimeJobReligionRequest } from '@/job/dto/request/create-full-time-job-religion.request';
import { EditFullTimeJobArtOrganizationRequest } from '@/job/dto/request/edit-full-time-job-art-organization.request';
import { EditFullTimeJobReligionRequest } from '@/job/dto/request/edit-full-time-job-religion.request';

@RestApiController('/jobs', 'Job')
export class JobController {
  constructor(private readonly fullTimeJobService: FullTimeJobService) {}

  @RestApiGet(FullTimeJobsResponse, { path: '/full-time', description: '정규직 채용 목록 조회' })
  async getFullTimeJobs(@Query() request: GetFullTimeJobsRequest) {
    const jobs = await this.fullTimeJobService.getFullTimeJobs(request.toGetCommand());
    const totalCount = await this.fullTimeJobService.countFullTimeJobs(request.toCountCommand());

    return new FullTimeJobsResponse({ jobs: jobs, totalCount: totalCount });
  }

  @RestApiGet(FullTimeJobDetailResponse, { path: '/full-time/:jobId', description: '정규직 채용 단건 조회' })
  async getFullTimeJob(@Param('jobId') jobId: number) {
    const job = await this.fullTimeJobService.getFullTimeJob(jobId);

    return new FullTimeJobDetailResponse(job);
  }

  @RestApiDelete(OkResponse, { path: '/full-time/:jobId', description: '정규직 채용 삭제' })
  async deleteFullTimeJob(@Param('jobId') jobId: number): Promise<OkResponse> {
    await this.fullTimeJobService.deleteFullTimeJob(jobId);
    return new OkResponse();
  }

  @RestApiPost(CreatedResponse, { path: '/full-time/art-organization', description: '정규직 채용 생성 (예술 단체)', auth: [USER_TYPE.CLIENT] })
  async createFullTimeJobArtOrganization(
    @Signature() signature: UserSignature,
    @Body() request: CreateFullTimeJobArtOrganizationRequest,
  ): Promise<CreatedResponse> {
    await this.fullTimeJobService.createFullTimeJob(request.toCommand(signature.id));

    return new CreatedResponse(1);
  }

  @RestApiPut(OkResponse, { path: '/full-time/art-organization/:jobId', description: '정규직 채용 수정 (예술 단체)', auth: [USER_TYPE.CLIENT] })
  async editFullTimeJobArtOrganization(@Signature() signature: UserSignature, @Body() request: EditFullTimeJobArtOrganizationRequest): Promise<OkResponse> {
    await this.fullTimeJobService.editFullTimeJob(request.toCommand(signature.id));

    return new OkResponse();
  }

  @RestApiPost(CreatedResponse, { path: '/full-time/religion', description: '정규직 채용 생성 (종교)', auth: [USER_TYPE.CLIENT] })
  async createFullTimeJobReligion(@Signature() signature: UserSignature, @Body() request: CreateFullTimeJobReligionRequest): Promise<CreatedResponse> {
    await this.fullTimeJobService.createFullTimeJob(request.toCommand(signature.id));

    return new CreatedResponse(1);
  }

  @RestApiPut(OkResponse, { path: '/full-time/religion/:jobId', description: '정규직 채용 수정 (종교)', auth: [USER_TYPE.CLIENT] })
  async editFullTimeJobReligion(@Signature() signature: UserSignature, @Body() request: EditFullTimeJobReligionRequest): Promise<OkResponse> {
    await this.fullTimeJobService.editFullTimeJob(request.toCommand(signature.id));

    return new OkResponse();
  }
}
