import { JobCrawlerService } from './job-crawler.service';
import { CrawlSummary, JobSourceCrawler, emptySummary } from './source/job-source';

/**
 * 스펙:
 * 1) 소스 두 개가 동시에 돈다 — 둘 다 시작된 뒤에 끝난다 (순차가 아님)
 * 2) 한 소스가 throw 해도 다른 소스 결과는 나오고, 실패한 소스는 error 가 담긴 빈 요약
 * 3) keys 로 일부만 고를 수 있고, 모르는 키는 400 JOB-CRAWLER-002
 * 4) 실행 중 다시 부르면 409 JOB-CRAWLER-001, 끝나면 다시 가능
 */
function source(key: string, impl: (date: string, log: string[]) => Promise<CrawlSummary>, log: string[]): JobSourceCrawler {
  const s: JobSourceCrawler = { key, name: key.toUpperCase(), crawl: date => impl(date, log) };
  return s;
}
const done = (s: JobSourceCrawler, date: string, scanned: number): CrawlSummary => ({ ...emptySummary(s, date), scanned });

describe('JobCrawlerService', () => {
  it('모든 소스를 동시에 돌린다', async () => {
    const log: string[] = [];
    let releaseA!: () => void;
    const gateA = new Promise<void>(r => (releaseA = r));
    const a = source(
      'a',
      async (date, l) => {
        l.push('a:start');
        await gateA;
        l.push('a:end');
        return done(a, date, 1);
      },
      log,
    );
    const b = source(
      'b',
      async (date, l) => {
        l.push('b:start');
        l.push('b:end');
        releaseA();
        return done(b, date, 2);
      },
      log,
    );
    const service = new JobCrawlerService([a, b]);
    const result = await service.runAll('2026-10-20');
    expect(log).toEqual(['a:start', 'b:start', 'b:end', 'a:end']);
    expect(result.map(r => [r.source, r.scanned])).toEqual([
      ['a', 1],
      ['b', 2],
    ]);
  });

  it('한 소스가 실패해도 다른 소스는 결과를 낸다', async () => {
    const log: string[] = [];
    const ok = source('ok', async date => done(ok, date, 3), log);
    const bad = source(
      'bad',
      async () => {
        throw new Error('목록을 못 읽음');
      },
      log,
    );
    const result = await new JobCrawlerService([ok, bad]).runAll('2026-10-20');
    expect(result[0]).toMatchObject({ source: 'ok', scanned: 3 });
    expect(result[1]).toMatchObject({ source: 'bad', sourceName: 'BAD', scanned: 0, created: [], error: '목록을 못 읽음' });
  });

  it('keys 로 일부만 고르고, 모르는 키는 400', async () => {
    const log: string[] = [];
    const a = source('a', async date => done(a, date, 1), log);
    const b = source('b', async date => done(b, date, 2), log);
    const service = new JobCrawlerService([a, b]);
    expect(service.sourceKeys).toEqual(['a', 'b']);
    expect((await service.runAll('2026-10-20', ['b'])).map(r => r.source)).toEqual(['b']);
    await expect(service.runAll('2026-10-20', ['zzz'])).rejects.toMatchObject({ status: 400, response: { code: 'JOB-CRAWLER-002' } });
  });

  it('실행 중이면 409, 끝나면 다시 가능', async () => {
    const log: string[] = [];
    let release!: () => void;
    const gate = new Promise<void>(r => (release = r));
    const slow = source(
      'slow',
      async date => {
        await gate;
        return done(slow, date, 0);
      },
      log,
    );
    const service = new JobCrawlerService([slow]);
    const first = service.runAll('2026-10-20');
    expect(service.isRunning).toBe(true);
    await expect(service.runAll('2026-10-20')).rejects.toMatchObject({ status: 409, response: { code: 'JOB-CRAWLER-001' } });
    release();
    await first;
    expect(service.isRunning).toBe(false);
    await expect(service.runAll('2026-10-20')).resolves.toHaveLength(1);
  });
});
