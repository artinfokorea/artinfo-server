import { RestApiController, RestApiGet } from '@/common/decorator/rest-api';
import { FullTimeJobService } from '@/job/service/full-time-job.service';
import { FullTimeJobsResponse } from '@/job/dto/response/full-time-jobs.response';
import { Query } from '@nestjs/common';
import { GetFullTimeJobsRequest } from '@/job/dto/request/get-full-time-jobs.request';

@RestApiController('/jobs', 'Job')
export class JobController {
  constructor(private readonly fullTimeJobService: FullTimeJobService) {}

  @RestApiGet(FullTimeJobsResponse, { path: '/full-time', description: '정규직 채용 목록 조회' })
  async getFullTimeJobs(@Query() request: GetFullTimeJobsRequest) {
    const jobs = await this.fullTimeJobService.getFullTimeJobs(request.toGetCommand());
    const totalCount = await this.fullTimeJobService.countFullTimeJobs(request.toCountCommand());

    return new FullTimeJobsResponse({ jobs: jobs, totalCount: totalCount });
  }
}
