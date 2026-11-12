import * as fs from 'fs';
import * as path from 'path';
import { ChuncheonNoticeGateway, ChuncheonNoticeClient } from './chuncheon-notice.client';
import { ChuncheonPhilharmonicJobCrawler } from './chuncheon-philharmonic-job.crawler';
import { JobSourceSupport, NoticeRegistration } from '../source/job-source.support';

/**
 * 스펙 (사이트는 가짜 게이트웨이, 등록·로고 업로드는 가짜 JobSourceSupport, 파서는 실제 픽스처):
 * 1) 2026-11-09: 1페이지(고정 3 + 일반 7) 에서 그날 글은 고정 글 "춘천시립교향악단 상임단원 선발 전형(정정) 공고" 1건
 *    → 첨부는 응시원서 hwp · 과제곡 pdf 뿐이라 받지 않고 본문 이미지 1장을 받아 images 로 등록 요청 (file 없음)
 *    - 제목 · 단체명 춘천시립교향악단 · 주소 '강원특별자치도 춘천시 효자상길5번길 13' · 상세 '춘천문화예술회관' · 대표 이미지(로고 업로드 URL) · URL · 본문(빈 글)
 *    - 1페이지 일반 행(2026-11-06…)이 그날보다 오래됐으므로 2페이지는 읽지 않는다
 * 2) 2026-11-06: 일반 행 "… 선발 전형 공고"(13696) 1건 대상, 고정 글 "…(청소년교향악단, 청소년합창단) 비상임 지도강사 …" 는 제외 — 본문 글과 이미지로 등록
 * 3) '공고' 가 든 HWP 첨부가 있으면 그것을 받아 file 로 등록하고 본문 이미지는 받지 않는다
 * 4) 같은 URL 이 이미 있으면 skipped (다운로드·등록 안 함)
 * 5) 다른 날짜면 scanned 0 · matched 0
 * 6) 이미지 다운로드 실패는 failed 로 모이고 예외를 올리지 않는다
 * 7) 같은 날짜라도 청소년합창단 모집(11-11) · 합창단 최종 결과(10-30) · 1차 합격자(10-27) · 교향악단 채용 최종 결과(01-29) 는 대상이 아니다
 * 8) 1페이지 일반 행이 모두 그날이면 2페이지를 읽고, 행이 없으면 멈춘다
 * 9) 대표 이미지는 환경 변수 URL 이 있으면 그것, 없으면 JobSourceSupport.logoUrl 이 올린 URL
 */
const fixture = (name: string) => fs.readFileSync(path.join(__dirname, '__fixtures__', name), 'utf8');
const page1 = fixture('list-2026-11-12-p1.html');
const page2 = fixture('list-2026-11-12-p2.html');
const LOGO = 'https://artinfo.s3.ap-northeast-2.amazonaws.com/prod/upload/42/jobs/logo/chuncheon.png';
const NOTICE_HWP = '<div class="attachFile"><a href="/egf/bp/common/front/99/download">상임단원 선발 공고문.hwp</a></div>';

function build(opts: { existing?: number; downloadError?: string; pages?: Record<number, string>; detail?: Record<string, string> } = {}) {
  const calls = {
    list: [] as number[],
    detail: [] as string[],
    download: [] as string[],
    referers: [] as string[],
    logo: [] as string[],
    registrations: [] as NoticeRegistration[],
  };
  const gateway: ChuncheonNoticeGateway = {
    fetchListPage: async page => {
      calls.list.push(page);
      return opts.pages?.[page] ?? (page === 1 ? page1 : page2);
    },
    fetchDetail: async row => {
      calls.detail.push(row.id);
      return opts.detail?.[row.id] ?? fixture(`detail-${row.id}.html`);
    },
    download: async (url, referer) => {
      calls.download.push(url);
      calls.referers.push(referer);
      if (opts.downloadError) throw new Error(opts.downloadError);
      return Buffer.from(url.endsWith('/download') ? 'hwp' : `jpg:${decodeURIComponent(url.slice(url.lastIndexOf('/') + 1))}`);
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
      return {
        jobId: 999,
        title: input.title,
        url: input.url,
        attachment: input.file?.name ?? `본문 이미지 ${input.images?.length ?? 0}장`,
        pageCount: input.file ? 2 : (input.images?.length ?? 0),
        majors: [],
      };
    },
  } as unknown as JobSourceSupport;
  const crawler = new ChuncheonPhilharmonicJobCrawler({} as ChuncheonNoticeClient, support, gateway);
  return { crawler, calls };
}

const URL_13701 = 'https://cccf.or.kr/art/company_news/recruit_notice?articleSeq=13701';
const URL_13696 = 'https://cccf.or.kr/art/company_news/recruit_notice?articleSeq=13696';
const IMAGE_13701 = 'https://cccf.or.kr/upload/image_attach/2026/11/%EC%83%81%EC%9E%84%EB%8B%A8%EC%9B%90%20%EC%A0%95%EC%A0%95%20%EA%B3%B5%EA%B3%A0001-vert.jpg';
const TITLE_13701 = '춘천시립교향악단 상임단원 선발 전형(정정) 공고';

describe('ChuncheonPhilharmonicJobCrawler', () => {
  it('그날 올라온(고정 글) 정정 공고 1건을 본문 이미지로 등록 요청한다', async () => {
    const { crawler, calls } = build();
    const summary = await crawler.crawl('2026-11-09');

    expect(summary).toMatchObject({ source: 'chuncheon', sourceName: '춘천시립교향악단', date: '2026-11-09', scanned: 1, matched: 1, skipped: [], failed: [] });
    expect(summary.created).toEqual([{ jobId: 999, title: TITLE_13701, url: URL_13701, attachment: '본문 이미지 1장', pageCount: 1, majors: [] }]);
    expect(calls.list).toEqual([1]);
    expect(calls.detail).toEqual(['13701']);
    expect(calls.download).toEqual([IMAGE_13701]);
    expect(calls.referers).toEqual([URL_13701]);
    expect(calls.logo).toEqual(['chuncheon:assets/job-crawler/chuncheon.png']);

    const reg = calls.registrations[0];
    expect(reg).toMatchObject({
      source: 'chuncheon',
      title: TITLE_13701,
      url: URL_13701,
      bodyText: '',
      companyName: '춘천시립교향악단',
      address: '강원특별자치도 춘천시 효자상길5번길 13',
      addressDetail: '춘천문화예술회관',
      imageUrl: LOGO,
      date: '2026-11-09',
    });
    expect(reg.file).toBeUndefined();
    expect(reg.images).toEqual([{ name: '상임단원 정정 공고001-vert.jpg', buffer: Buffer.from('jpg:상임단원 정정 공고001-vert.jpg') }]);
  });

  it('일반 행의 원 공고는 대상이고 같은 날 고정 글(지도강사)은 대상이 아니다', async () => {
    const { crawler, calls } = build();
    const summary = await crawler.crawl('2026-11-06');
    expect(summary).toMatchObject({ scanned: 2, matched: 1, skipped: [], failed: [] });
    expect(calls.detail).toEqual(['13696']);
    expect(calls.registrations[0]).toMatchObject({
      title: '춘천시립교향악단 상임단원 선발 전형 공고',
      url: URL_13696,
      bodyText: '본 공고는 변경 전 공고입니다.\n\n변경된 공고를(2026-203호) 확인하여 주시기 바랍니다',
    });
    expect(calls.registrations[0].images?.map(i => i.name)).toEqual(['붙임1_청소년교향악단 2026년도 제2차 비상임단원 선발 공고문001-vert.jpg']);
  });

  it("'공고' HWP 첨부가 있으면 그것을 받아 file 로 등록하고 본문 이미지는 받지 않는다", async () => {
    const withHwp = fixture('detail-13701.html').replace('<div class="attachFile ">', `${NOTICE_HWP}<div class="attachFile ">`);
    const { crawler, calls } = build({ detail: { '13701': withHwp } });
    const summary = await crawler.crawl('2026-11-09');
    expect(summary.created).toEqual([expect.objectContaining({ attachment: '상임단원 선발 공고문.hwp', pageCount: 2 })]);
    expect(calls.download).toEqual(['https://cccf.or.kr/egf/bp/common/front/99/download']);
    expect(calls.registrations[0].file).toEqual({ name: '상임단원 선발 공고문.hwp', buffer: Buffer.from('hwp') });
    expect(calls.registrations[0].images).toEqual([]);
  });

  it('이미 등록된 공고는 건너뛴다', async () => {
    const { crawler, calls } = build({ existing: 123 });
    const summary = await crawler.crawl('2026-11-09');
    expect(summary.created).toEqual([]);
    expect(summary.skipped).toEqual([{ title: TITLE_13701, url: URL_13701, reason: '이미 등록됨 (job 123)' }]);
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

  it('이미지 다운로드가 실패하면 failed 에 담고 예외를 올리지 않는다', async () => {
    const { crawler } = build({ downloadError: '다운로드 실패: x' });
    const summary = await crawler.crawl('2026-11-09');
    expect(summary.created).toEqual([]);
    expect(summary.failed).toEqual([{ title: TITLE_13701, url: URL_13701, reason: '다운로드 실패: x' }]);
  });

  it('청소년합창단 모집 · 결과 · 1차 합격자 · 교향악단 채용 최종 결과 공고는 대상이 아니다', async () => {
    const { crawler, calls } = build();
    expect(await crawler.crawl('2026-11-11')).toMatchObject({ scanned: 1, matched: 0 });
    expect(await crawler.crawl('2026-10-30')).toMatchObject({ scanned: 1, matched: 0 });
    expect(await crawler.crawl('2026-10-27')).toMatchObject({ scanned: 1, matched: 0 });
    expect(calls.detail).toEqual([]);

    const { crawler: b, calls: callsB } = build({ pages: { 1: page2 } });
    expect(await b.crawl('2026-01-29')).toMatchObject({ scanned: 1, matched: 0 });
    expect(callsB.detail).toEqual([]);
  });

  it('1페이지 일반 행이 모두 그날이면 2페이지를 읽고, 행이 없으면 멈춘다', async () => {
    const allToday = page1.replace(/\d{4}-\d{2}-\d{2}/g, '2026-11-09');
    const { crawler, calls } = build({ pages: { 1: allToday, 2: page2 } });
    const summary = await crawler.crawl('2026-11-09');
    expect(calls.list).toEqual([1, 2]);
    expect(summary.scanned).toBe(10);

    const { crawler: empty, calls: emptyCalls } = build({ pages: { 1: '<html><body>점검 중</body></html>' } });
    expect(await empty.crawl('2026-11-09')).toMatchObject({ scanned: 0 });
    expect(emptyCalls.list).toEqual([1]);
  });

  it('대표 이미지 URL 이 설정돼 있으면 로고를 올리지 않는다', async () => {
    const { jobCrawlerConfig } = await import('../job-crawler.config');
    const previous = jobCrawlerConfig.chuncheon.imageUrl;
    jobCrawlerConfig.chuncheon.imageUrl = 'https://cdn.example.com/chuncheon.png';
    try {
      const { crawler, calls } = build();
      await crawler.crawl('2026-11-09');
      expect(calls.logo).toEqual([]);
      expect(calls.registrations[0].imageUrl).toBe('https://cdn.example.com/chuncheon.png');
    } finally {
      jobCrawlerConfig.chuncheon.imageUrl = previous;
    }
  });
});
