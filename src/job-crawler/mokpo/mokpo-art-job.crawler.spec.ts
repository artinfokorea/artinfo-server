import * as fs from 'fs';
import * as path from 'path';
import { MokpoNoticeGateway, MokpoNoticeClient } from './mokpo-notice.client';
import { MokpoArtJobCrawler } from './mokpo-art-job.crawler';
import { JobSourceSupport, NoticeRegistration } from '../source/job-source.support';

/**
 * 스펙 (사이트는 가짜 게이트웨이, 등록은 가짜 JobSourceSupport, 파서는 실제 픽스처):
 * 1) 2026-10-20 목록(그날 14건 + 10-19 1건) 중 "목포시립예술단 … 채용" 1건 → 공고문 hwpx 다운로드 → 등록 요청
 *    - 제목 · 단체명 목포시립예술단 · 주소 '전남광주통합특별시 목포시 양을로 203' · 상세 '목포시청 3층 문화예술과' · 대표 이미지 URL · URL · 본문
 *    - 1페이지에 전날 행이 있으므로 2페이지는 읽지 않는다
 * 2) 같은 URL 이 이미 있으면 skipped (다운로드·등록 안 함)
 * 3) 다른 날짜면 scanned 0 · matched 0
 * 4) 다운로드 실패는 failed 로 모이고 나머지 흐름은 계속된다
 * 5) 1페이지가 모두 그날이면 2페이지를 읽고, 전날 행이 나오거나 빈 페이지면 멈춘다
 */
const fixture = (name: string) => fs.readFileSync(path.join(__dirname, '__fixtures__', name), 'utf8');
const olderPage = fixture('list-2026-10-20.html').replace(/2026-10-20/g, '2026-10-19');
/** 15행 모두 그날인 1페이지 (픽스처의 10-19 행을 10-20 으로) */
const fullTodayPage = fixture('list-2026-10-20.html').replace(/2026-10-19/g, '2026-10-20');

function build(opts: { existing?: number; downloadError?: string; pages?: Record<number, string> } = {}) {
  const calls = { list: [] as number[], detail: [] as string[], download: [] as string[], registrations: [] as NoticeRegistration[] };
  const gateway: MokpoNoticeGateway = {
    fetchListPage: async page => {
      calls.list.push(page);
      return opts.pages?.[page] ?? (page === 1 ? fixture('list-2026-10-20.html') : olderPage);
    },
    fetchDetail: async idx => {
      calls.detail.push(idx);
      return {
        url: `https://www.mokpo.go.kr/www/mokpo_news/notification/public_notice?idx=${idx}&mode=view`,
        html: fixture('detail-55362.html'),
        cookies: ['SESSION=1'],
      };
    },
    downloadAttachment: async (_page, _token, att) => {
      calls.download.push(att.name);
      if (opts.downloadError) throw new Error(opts.downloadError);
      return Buffer.from('hwpx');
    },
  };
  const support = {
    findRegisteredJobId: async () => opts.existing ?? null,
    register: async (input: NoticeRegistration) => {
      calls.registrations.push(input);
      return { jobId: 777, title: input.title, url: input.url, attachment: input.file.name, pageCount: 6, majors: ['TRUMPET', 'SOPRANO'] };
    },
  } as unknown as JobSourceSupport;
  const crawler = new MokpoArtJobCrawler({} as MokpoNoticeClient, support, gateway);
  return { crawler, calls };
}

describe('MokpoArtJobCrawler', () => {
  it('그날 채용 공고 1건을 내려받아 등록을 요청한다', async () => {
    const { crawler, calls } = build();
    const summary = await crawler.crawl('2026-10-20');

    expect(summary).toMatchObject({ source: 'mokpo', sourceName: '목포시립예술단', date: '2026-10-20', scanned: 14, matched: 1, skipped: [], failed: [] });
    expect(summary.created).toEqual([
      {
        jobId: 777,
        title: '2026년도 목포시립예술단 단원 공개채용 공고',
        url: 'https://www.mokpo.go.kr/www/mokpo_news/notification/public_notice?idx=55362&mode=view',
        attachment: '(공고문) 2026 시립예술단 단원 채용 모집 공고.hwpx',
        pageCount: 6,
        majors: ['TRUMPET', 'SOPRANO'],
      },
    ]);
    expect(calls.list).toEqual([1]);
    expect(calls.detail).toEqual(['55362']);
    expect(calls.download).toEqual(['(공고문) 2026 시립예술단 단원 채용 모집 공고.hwpx']);

    const reg = calls.registrations[0];
    expect(reg).toMatchObject({
      source: 'mokpo',
      title: '2026년도 목포시립예술단 단원 공개채용 공고',
      url: 'https://www.mokpo.go.kr/www/mokpo_news/notification/public_notice?idx=55362&mode=view',
      companyName: '목포시립예술단',
      address: '전남광주통합특별시 목포시 양을로 203',
      addressDetail: '목포시청 3층 문화예술과',
      imageUrl: 'https://artinfo.s3.ap-northeast-2.amazonaws.com/prod/upload/4637/images/20261020/original/cLa2DrY-gIr.1792501357272.png',
      date: '2026-10-20',
    });
    expect(reg.file.name).toBe('(공고문) 2026 시립예술단 단원 채용 모집 공고.hwpx');
    expect(reg.file.buffer.toString()).toBe('hwpx');
    expect(reg.bodyText.startsWith('목포시립예술단의 안정적인 운영과')).toBe(true);
  });

  it('같은 URL 이 이미 등록돼 있으면 건너뛴다', async () => {
    const { crawler, calls } = build({ existing: 5 });
    const summary = await crawler.crawl('2026-10-20');
    expect(summary.created).toEqual([]);
    expect(summary.skipped).toEqual([
      { title: '2026년도 목포시립예술단 단원 공개채용 공고', url: expect.stringContaining('idx=55362'), reason: '이미 등록됨 (job 5)' },
    ]);
    expect(calls.download).toEqual([]);
    expect(calls.registrations).toEqual([]);
  });

  it('다른 날짜면 아무것도 하지 않는다', async () => {
    const { crawler, calls } = build();
    const summary = await crawler.crawl('2026-10-21');
    expect(summary.scanned).toBe(0);
    expect(summary.matched).toBe(0);
    expect(calls.list).toEqual([1]);
    expect(calls.registrations).toEqual([]);
  });

  it('다운로드 실패는 failed 에 담긴다', async () => {
    const { crawler, calls } = build({ downloadError: '첨부파일 다운로드 실패' });
    const summary = await crawler.crawl('2026-10-20');
    expect(summary.failed).toEqual([
      { title: '2026년도 목포시립예술단 단원 공개채용 공고', url: expect.stringContaining('idx=55362'), reason: '첨부파일 다운로드 실패' },
    ]);
    expect(calls.registrations).toEqual([]);
  });

  it('1페이지가 모두 그날이면 2페이지를 읽고 전날 행이 나오면 멈춘다', async () => {
    const { crawler, calls } = build({ pages: { 1: fullTodayPage, 2: olderPage } });
    const summary = await crawler.crawl('2026-10-20');
    expect(summary.scanned).toBe(15);
    expect(calls.list).toEqual([1, 2]);
  });

  it('빈 페이지가 나오면 멈춘다', async () => {
    const { crawler, calls } = build({ pages: { 1: fullTodayPage, 2: '<html><body><table><tbody></tbody></table></body></html>' } });
    await crawler.crawl('2026-10-20');
    expect(calls.list).toEqual([1, 2]);
  });
});
