import { BadRequestException, ConflictException, Inject, Injectable, Logger } from '@nestjs/common';
import { CrawlSummary, JOB_SOURCE_CRAWLERS, JobSourceCrawler, emptySummary } from './source/job-source';

/** 등록된 모든 소스를 한 번에(동시에) 돌린다. 한 소스가 실패해도 다른 소스는 계속된다. */
@Injectable()
export class JobCrawlerService {
  private readonly logger = new Logger(JobCrawlerService.name);
  private running: Promise<CrawlSummary[]> | null = null;

  constructor(@Inject(JOB_SOURCE_CRAWLERS) private readonly sources: JobSourceCrawler[]) {}

  get sourceKeys(): string[] {
    return this.sources.map(s => s.key);
  }

  get isRunning(): boolean {
    return this.running !== null;
  }

  /**
   * keys 를 주면 그 소스만, 없으면 전부. 이미 실행 중이면 409.
   * 결과는 소스 등록 순서대로, 소스가 통째로 실패하면 error 가 담긴 요약으로 돌아온다.
   */
  async runAll(date: string, keys?: string[]): Promise<CrawlSummary[]> {
    const targets = this.pick(keys);
    if (this.running) throw new ConflictException({ code: 'JOB-CRAWLER-001', message: '크롤러가 이미 실행 중입니다. 끝난 뒤 다시 시도하세요.' });

    const run = Promise.allSettled(targets.map(source => source.crawl(date))).then(results =>
      results.map((result, i) => {
        if (result.status === 'fulfilled') return result.value;
        const reason = result.reason instanceof Error ? result.reason.message : String(result.reason);
        this.logger.error(`[${targets[i].key}] 소스 실패: ${reason}`);
        return { ...emptySummary(targets[i], date), error: reason };
      }),
    );
    this.running = run;
    try {
      return await run;
    } finally {
      this.running = null;
    }
  }

  private pick(keys?: string[]): JobSourceCrawler[] {
    if (!keys || keys.length === 0) return this.sources;
    const unknown = keys.filter(k => !this.sources.some(s => s.key === k));
    if (unknown.length) {
      throw new BadRequestException({ code: 'JOB-CRAWLER-002', message: `알 수 없는 소스: ${unknown.join(', ')} (가능: ${this.sourceKeys.join(', ')})` });
    }
    return this.sources.filter(s => keys.includes(s.key));
  }
}
