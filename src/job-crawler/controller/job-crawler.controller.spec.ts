import { JobCrawlerController } from './job-crawler.controller';
import { JobCrawlerService } from '../job-crawler.service';
import { CrawlSummary } from '../source/job-source';

/**
 * 스펙:
 * 1) date 를 주면 그 날짜로, source 를 주면 그 키들로 서비스를 부른다
 * 2) date 가 없으면 한국 시간 오늘(YYYY-MM-DD)
 * 3) 응답은 날짜 · 전체 등록 수 · 소스별 요약
 */
const summary = (source: string, created: number): CrawlSummary => ({
  source,
  sourceName: source,
  date: '2026-10-20',
  scanned: 3,
  matched: 1,
  created: Array.from({ length: created }, (_, i) => ({ jobId: i + 1, title: 't', url: 'u', attachment: 'a', pageCount: 1, majors: [] })),
  skipped: [],
  failed: [],
  elapsedMs: 5,
});

function build() {
  const calls: [string, string[] | undefined][] = [];
  const service = {
    runAll: async (date: string, keys?: string[]) => {
      calls.push([date, keys]);
      return [summary('mokpo', 2), summary('other', 1)];
    },
  } as unknown as JobCrawlerService;
  return { controller: new JobCrawlerController(service), calls };
}

describe('JobCrawlerController', () => {
  it('date · source 를 서비스로 넘기고 요약을 합친다', async () => {
    const { controller, calls } = build();
    const res = await controller.run({ date: '2026-10-20', source: ['mokpo'] });
    expect(calls).toEqual([['2026-10-20', ['mokpo']]]);
    expect(res.date).toBe('2026-10-20');
    expect(res.createdCount).toBe(3);
    expect(res.sources.map(s => [s.source, s.created.length])).toEqual([
      ['mokpo', 2],
      ['other', 1],
    ]);
  });

  it('date 가 없으면 한국 시간 오늘', async () => {
    const { controller, calls } = build();
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });
    const res = await controller.run({});
    expect(calls[0][0]).toBe(today);
    expect(calls[0][1]).toBeUndefined();
    expect(res.date).toBe(today);
  });
});
