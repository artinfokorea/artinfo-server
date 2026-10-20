import { Query } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { RestApiController, RestApiPost } from '@/common/decorator/rest-api';
import { USER_TYPE } from '@/user/entity/user.entity';
import { todayInKst } from '../job-crawler.config';
import { JobCrawlerService } from '../job-crawler.service';
import { RunJobCrawlerQuery } from '../dto/run-job-crawler.request';
import { JobCrawlerRunResponse } from '../dto/job-crawler.response';

/** 채용 공고 크롤러 수동 실행 (관리자). 스케줄(매일 23:00 KST)과 같은 일을 지정한 날짜로 바로, 모든 소스를 동시에 돌린다. */
@RestApiController('/job-crawler', 'JobCrawler')
export class JobCrawlerController {
  constructor(private readonly jobCrawlerService: JobCrawlerService) {}

  @ApiQuery({ name: 'date', required: false, type: String })
  @ApiQuery({ name: 'source', required: false, type: [String] })
  @RestApiPost(JobCrawlerRunResponse, {
    path: '/run',
    description: '지정한 날짜(기본 오늘 KST)에 올라온 채용 공고를 모든 소스에서 동시에 수집해 채용으로 등록 (관리자 전용). source 로 일부만 고를 수 있다',
    auth: [USER_TYPE.ADMIN],
  })
  async run(@Query() query: RunJobCrawlerQuery): Promise<JobCrawlerRunResponse> {
    const date = query.date ?? todayInKst();
    const summaries = await this.jobCrawlerService.runAll(date, query.source);
    return new JobCrawlerRunResponse(date, summaries);
  }
}
