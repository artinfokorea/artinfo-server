import { ConflictException, Query } from '@nestjs/common';
import { RestApiController, RestApiPost } from '@/common/decorator/rest-api';
import { USER_TYPE } from '@/user/entity/user.entity';
import { todayInKst } from '../job-crawler.config';
import { MokpoArtJobCrawler } from '../mokpo/mokpo-art-job.crawler';
import { RunJobCrawlerQuery } from '../dto/run-job-crawler.request';
import { JobCrawlerRunResponse } from '../dto/job-crawler.response';

/** 채용 공고 크롤러 수동 실행 (관리자). 스케줄(매일 23:00 KST)과 같은 일을 지정한 날짜로 바로 돌린다. */
@RestApiController('/job-crawler', 'JobCrawler')
export class JobCrawlerController {
  private running: Promise<unknown> | null = null;

  constructor(private readonly mokpoCrawler: MokpoArtJobCrawler) {}

  @RestApiPost(JobCrawlerRunResponse, {
    path: '/mokpo/run',
    description: '목포시 고시·공고에서 지정한 날짜(기본 오늘)의 목포시립예술단 채용 공고를 수집해 채용으로 등록 (관리자 전용)',
    auth: [USER_TYPE.ADMIN],
  })
  async runMokpo(@Query() query: RunJobCrawlerQuery): Promise<JobCrawlerRunResponse> {
    if (this.running) throw new ConflictException({ code: 'JOB-CRAWLER-001', message: '크롤러가 이미 실행 중입니다. 끝난 뒤 다시 시도하세요.' });
    const date = query.date ?? todayInKst();
    const run = this.mokpoCrawler.crawl(date);
    this.running = run.catch(() => undefined);
    try {
      return new JobCrawlerRunResponse(await run);
    } finally {
      this.running = null;
    }
  }
}
