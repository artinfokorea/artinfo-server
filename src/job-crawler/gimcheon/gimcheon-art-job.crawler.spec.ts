import * as fs from 'fs';
import * as path from 'path';
import { GimcheonNoticeGateway, GimcheonNoticeClient } from './gimcheon-notice.client';
import { GimcheonArtJobCrawler } from './gimcheon-art-job.crawler';
import { JobSourceSupport, NoticeRegistration } from '../source/job-source.support';

/**
 * 스펙 (사이트는 가짜 게이트웨이, 등록·로고 업로드는 가짜 JobSourceSupport, 파서는 실제 픽스처):
 * 1) 2026-11-11 목록 1페이지(10행) 에서 그날 글은 "2026년 김천시립예술단 지휘자(비상임) 모집 공고" 1건 → 공고문 hwpx 다운로드 → 등록 요청
 *    - 제목 · 단체명 김천시립예술단 · 주소 '경북 김천시 다삼로 3' · 상세 '3' · 대표 이미지(로고 업로드 URL) · URL · 본문
 *    - 1페이지 두 번째 행(2026-05-12)이 그날보다 오래됐으므로 2페이지는 읽지 않는다
 * 2) 같은 URL 이 이미 있으면 skipped (다운로드·등록 안 함)
 * 3) 다른 날짜면 scanned 0 · matched 0
 * 4) 다운로드 실패는 failed 로 모이고 예외를 올리지 않는다
 * 5) 대상이 아닌 제목: '예술아카데미 수강신청서' (2026-05-12) · '… 서류전형(1차) 합격자 및 면접일정 공고' (2024-12-10) · '회관 기간제근로자 채용' (2024-06-25)
 *    반면 '김천' 이 빠진 "2024 시립예술단(비상임) 신규 단원(국악단, 합창단) 모집 공고" (2024-04-11) 는 대상이다
 * 6) 1페이지가 모두 그날이면 2페이지를 읽고, 행이 없으면 멈춘다
 * 7) 대표 이미지는 환경 변수 URL 이 있으면 그것, 없으면 JobSourceSupport.logoUrl 이 올린 URL
 */
const fixture = (name: string) => fs.readFileSync(path.join(__dirname, '__fixtures__', name), 'utf8');
const page1 = fixture('list-2026-11-12-p1.html');
const page2 = fixture('list-2026-11-12-p2.html');
const LOGO = 'https://artinfo.s3.ap-northeast-2.amazonaws.com/prod/upload/42/jobs/logo/gimcheon.png';

function build(opts: { existing?: number; downloadError?: string; pages?: Record<number, string> } = {}) {
  const calls = { list: [] as number[], detail: [] as string[], download: [] as string[], logo: [] as string[], registrations: [] as NoticeRegistration[] };
  const gateway: GimcheonNoticeGateway = {
    fetchListPage: async page => {
      calls.list.push(page);
      return opts.pages?.[page] ?? (page === 1 ? page1 : page2);
    },
    fetchDetail: async id => {
      calls.detail.push(id);
      return fixture('detail-4544687.html');
    },
    downloadAttachment: async att => {
      calls.download.push(att.name);
      if (opts.downloadError) throw new Error(opts.downloadError);
      return Buffer.from('hwpx');
    },
  };
  const support = {
    findRegisteredJobId: async () => opts.existing ?? null,
    logoUrl: async (source: string, file: string) => {
      calls.logo.push(`${source}:${file}`);
      return LOGO;
    },
    register: async (input: NoticeRegistration) => {
      calls.registrations.push(input);
      return { jobId: 999, title: input.title, url: input.url, attachment: input.file?.name, pageCount: 2, majors: ['CONDUCTOR'] };
    },
  } as unknown as JobSourceSupport;
  const crawler = new GimcheonArtJobCrawler({} as GimcheonNoticeClient, support, gateway);
  return { crawler, calls };
}

const NOTICE_URL = 'https://www.gc.go.kr/gcart/bbs/view.do?bIdx=4544687&ptIdx=1807&mId=0601000000';
const NOTICE_FILE = '공고문(2026 김천시립예술단 지휘자(비상임) 모집).hwpx';
const TITLE = '2026년 김천시립예술단 지휘자(비상임) 모집 공고';

describe('GimcheonArtJobCrawler', () => {
  it('그날 올라온 채용 공고 1건을 내려받아 등록을 요청한다', async () => {
    const { crawler, calls } = build();
    const summary = await crawler.crawl('2026-11-11');

    expect(summary).toMatchObject({ source: 'gimcheon', sourceName: '김천시립예술단', date: '2026-11-11', scanned: 1, matched: 1, skipped: [], failed: [] });
    expect(summary.created).toEqual([{ jobId: 999, title: TITLE, url: NOTICE_URL, attachment: NOTICE_FILE, pageCount: 2, majors: ['CONDUCTOR'] }]);
    expect(calls.list).toEqual([1]);
    expect(calls.detail).toEqual(['4544687']);
    expect(calls.download).toEqual([NOTICE_FILE]);
    expect(calls.logo).toEqual(['gimcheon:assets/job-crawler/gimcheon.png']);

    const reg = calls.registrations[0];
    expect(reg).toMatchObject({
      source: 'gimcheon',
      title: TITLE,
      url: NOTICE_URL,
      companyName: '김천시립예술단',
      address: '경북 김천시 다삼로 3',
      addressDetail: '3',
      imageUrl: LOGO,
      date: '2026-11-11',
    });
    expect(reg.file).toEqual({ name: NOTICE_FILE, buffer: Buffer.from('hwpx') });
    expect(reg.bodyText).toContain('1. 접수기간 : 2026. 11. 23.(월) ~ 11. 26.(목) (4일간)');
  });

  it('이미 등록된 공고는 건너뛴다', async () => {
    const { crawler, calls } = build({ existing: 123 });
    const summary = await crawler.crawl('2026-11-11');
    expect(summary.created).toEqual([]);
    expect(summary.skipped).toEqual([{ title: TITLE, url: NOTICE_URL, reason: '이미 등록됨 (job 123)' }]);
    expect(calls.detail).toEqual([]);
    expect(calls.download).toEqual([]);
  });

  it('그날 올라온 글이 없으면 아무것도 하지 않는다', async () => {
    const { crawler, calls } = build();
    const summary = await crawler.crawl('2026-11-12');
    expect(summary).toMatchObject({ scanned: 0, matched: 0, created: [], skipped: [], failed: [] });
    expect(calls.list).toEqual([1]);
    expect(calls.detail).toEqual([]);
  });

  it('다운로드가 실패하면 failed 에 담고 예외를 올리지 않는다', async () => {
    const { crawler } = build({ downloadError: '첨부파일 다운로드 실패: x' });
    const summary = await crawler.crawl('2026-11-11');
    expect(summary.created).toEqual([]);
    expect(summary.failed).toEqual([{ title: TITLE, url: NOTICE_URL, reason: '첨부파일 다운로드 실패: x' }]);
  });

  it('수강신청서·전형 단계 안내·회관 기간제 채용은 대상이 아니고, 김천이 빠진 시립예술단 모집은 대상이다', async () => {
    const { crawler: a, calls: callsA } = build();
    expect(await a.crawl('2026-05-12')).toMatchObject({ scanned: 1, matched: 0, created: [] });
    expect(callsA.detail).toEqual([]);

    const { crawler: b, calls: callsB } = build({ pages: { 1: page2 } });
    expect(await b.crawl('2024-12-10')).toMatchObject({ scanned: 1, matched: 0, created: [] });
    expect(await b.crawl('2024-06-25')).toMatchObject({ scanned: 1, matched: 0, created: [] });
    expect(callsB.detail).toEqual([]);

    const { crawler: c, calls: callsC } = build({ pages: { 1: page2 } });
    expect(await c.crawl('2024-04-11')).toMatchObject({ scanned: 1, matched: 1 });
    expect(callsC.detail).toEqual(['4498259']);
  });

  it('1페이지가 모두 그날이면 2페이지를 읽고, 행이 없으면 멈춘다', async () => {
    const allToday = page1.replace(/\d{4}-\d{2}-\d{2}/g, '2026-11-11');
    const { crawler, calls } = build({ pages: { 1: allToday, 2: page2 } });
    const summary = await crawler.crawl('2026-11-11');
    expect(calls.list).toEqual([1, 2]);
    expect(summary.scanned).toBe(10);

    const { crawler: empty, calls: emptyCalls } = build({ pages: { 1: '<html><body>점검 중</body></html>' } });
    expect(await empty.crawl('2026-11-11')).toMatchObject({ scanned: 0 });
    expect(emptyCalls.list).toEqual([1]);
  });

  it('대표 이미지 URL 이 설정돼 있으면 로고를 올리지 않는다', async () => {
    const { jobCrawlerConfig } = await import('../job-crawler.config');
    const previous = jobCrawlerConfig.gimcheon.imageUrl;
    jobCrawlerConfig.gimcheon.imageUrl = 'https://cdn.example.com/gimcheon.png';
    try {
      const { crawler, calls } = build();
      await crawler.crawl('2026-11-11');
      expect(calls.logo).toEqual([]);
      expect(calls.registrations[0].imageUrl).toBe('https://cdn.example.com/gimcheon.png');
    } finally {
      jobCrawlerConfig.gimcheon.imageUrl = previous;
    }
  });
});
