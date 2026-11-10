import * as fs from 'fs';
import * as path from 'path';
import { IncheonNoticeGateway, IncheonNoticeClient } from './incheon-notice.client';
import { IncheonPhilharmonicJobCrawler } from './incheon-philharmonic-job.crawler';
import { JobSourceSupport, NoticeRegistration } from '../source/job-source.support';

/**
 * 스펙 (사이트는 가짜 게이트웨이, 등록·로고 업로드는 가짜 JobSourceSupport, 파서는 실제 픽스처):
 * 1) 2026-11-10 목록 1페이지(고정 공지 4 + 일반 10) 에서 그날 글은 고정 공지 "2027 인천시립교향악단 및 청소년교향악단 신규단원 공개모집 공고" 1건
 *    → 공고문 hwpx 다운로드(악보 pdf 는 아님) → 등록 요청
 *    - 제목 · 단체명 인천시립교향악단 · 주소 '인천 남동구 예술로 149' · 상세 '인천시립교향악단' · 대표 이미지(로고 업로드 URL) · URL · 본문
 *    - 1페이지 일반 행이 그날보다 오래됐으므로 2페이지는 읽지 않는다
 * 2) 같은 URL 이 이미 있으면 skipped (다운로드·등록 안 함)
 * 3) 다른 날짜면 scanned 0 · matched 0
 * 4) 다운로드 실패는 failed 로 모이고 나머지 흐름은 계속된다
 * 5) 같은 날짜라도 '인천시립합창단 … 모집' (2026-11-03) 은 대상이 아니고, '… 공개모집 1차 실기전형 공고' (2026-05-28) 도 대상이 아니다
 * 6) 1페이지 일반 행이 모두 그날이면 2페이지를 읽고, 일반 행이 없으면 멈춘다
 * 7) 대표 이미지는 환경 변수 URL 이 있으면 그것, 없으면 JobSourceSupport.logoUrl 이 올린 URL
 */
const fixture = (name: string) => fs.readFileSync(path.join(__dirname, '__fixtures__', name), 'utf8');
const page1 = fixture('list-2026-11-10-p1.html');
const page2 = fixture('list-2026-11-10-p2.html');
const LOGO = 'https://artinfo.s3.ap-northeast-2.amazonaws.com/prod/upload/42/jobs/logo/incheon.png';

function build(opts: { existing?: number; downloadError?: string; pages?: Record<number, string> } = {}) {
  const calls = { list: [] as number[], detail: [] as string[], download: [] as string[], logo: [] as string[], registrations: [] as NoticeRegistration[] };
  const gateway: IncheonNoticeGateway = {
    fetchListPage: async page => {
      calls.list.push(page);
      return opts.pages?.[page] ?? (page === 1 ? page1 : page2);
    },
    fetchDetail: async id => {
      calls.detail.push(id);
      return fixture('detail-3094311.html');
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
      return { jobId: 999, title: input.title, url: input.url, attachment: input.file?.name, pageCount: 3, majors: ['TROMBONE'] };
    },
  } as unknown as JobSourceSupport;
  const crawler = new IncheonPhilharmonicJobCrawler({} as IncheonNoticeClient, support, gateway);
  return { crawler, calls };
}

const NOTICE_URL = 'https://www.incheon.go.kr/art/ART040102/3094311';
const NOTICE_FILE = '2027 인천시립교향악단 출연단원 및 청소년교향악단 기획운영단원 공개모집 공고.hwpx';
const TITLE = '2027 인천시립교향악단 및 청소년교향악단 신규단원 공개모집 공고';

describe('IncheonPhilharmonicJobCrawler', () => {
  it('그날 올라온(고정 공지) 채용 공고 1건을 내려받아 등록을 요청한다', async () => {
    const { crawler, calls } = build();
    const summary = await crawler.crawl('2026-11-10');

    expect(summary).toMatchObject({ source: 'incheon', sourceName: '인천시립교향악단', date: '2026-11-10', scanned: 1, matched: 1, skipped: [], failed: [] });
    expect(summary.created).toEqual([{ jobId: 999, title: TITLE, url: NOTICE_URL, attachment: NOTICE_FILE, pageCount: 3, majors: ['TROMBONE'] }]);
    expect(calls.list).toEqual([1]);
    expect(calls.detail).toEqual(['3094311']);
    expect(calls.download).toEqual([NOTICE_FILE]);
    expect(calls.logo).toEqual(['incheon:assets/job-crawler/incheon.png']);

    const reg = calls.registrations[0];
    expect(reg).toMatchObject({
      source: 'incheon',
      title: TITLE,
      url: NOTICE_URL,
      companyName: '인천시립교향악단',
      address: '인천 남동구 예술로 149',
      addressDetail: '인천시립교향악단',
      imageUrl: LOGO,
      date: '2026-11-10',
    });
    expect(reg.file).toEqual({ name: NOTICE_FILE, buffer: Buffer.from('hwpx') });
    expect(reg.bodyText).toContain('인천시립교향악단 출연단원 및 청소년교향악단 기획운영단원을 다음과 같이 공개모집하오니');
  });

  it('이미 등록된 공고는 건너뛴다', async () => {
    const { crawler, calls } = build({ existing: 123 });
    const summary = await crawler.crawl('2026-11-10');
    expect(summary.created).toEqual([]);
    expect(summary.skipped).toEqual([{ title: TITLE, url: NOTICE_URL, reason: '이미 등록됨 (job 123)' }]);
    expect(calls.detail).toEqual([]);
    expect(calls.download).toEqual([]);
  });

  it('그날 올라온 글이 없으면 아무것도 하지 않는다', async () => {
    const { crawler, calls } = build();
    const summary = await crawler.crawl('2026-11-11');
    expect(summary).toMatchObject({ scanned: 0, matched: 0, created: [], skipped: [], failed: [] });
    expect(calls.list).toEqual([1]);
    expect(calls.detail).toEqual([]);
  });

  it('다운로드가 실패하면 failed 에 담고 예외를 올리지 않는다', async () => {
    const { crawler } = build({ downloadError: '첨부파일 다운로드 실패: x' });
    const summary = await crawler.crawl('2026-11-10');
    expect(summary.created).toEqual([]);
    expect(summary.failed).toEqual([{ title: TITLE, url: NOTICE_URL, reason: '첨부파일 다운로드 실패: x' }]);
  });

  it('합창단 모집과 전형 단계 안내 공고는 대상이 아니다', async () => {
    const { crawler: a, calls: callsA } = build();
    expect(await a.crawl('2026-11-03')).toMatchObject({ scanned: 1, matched: 0, created: [] });
    expect(callsA.detail).toEqual([]);

    const { crawler: b, calls: callsB } = build({ pages: { 1: page2 } });
    expect(await b.crawl('2026-05-28')).toMatchObject({ scanned: 1, matched: 0, created: [] });
    expect(callsB.detail).toEqual([]);
  });

  it('1페이지 일반 행이 모두 그날이면 2페이지를 읽고, 일반 행이 없으면 멈춘다', async () => {
    const allToday = page1.replace(/\d{4}-\d{2}-\d{2}/g, '2026-11-10');
    const { crawler, calls } = build({ pages: { 1: allToday, 2: page2 } });
    const summary = await crawler.crawl('2026-11-10');
    expect(calls.list).toEqual([1, 2]);
    expect(summary.scanned).toBe(14);

    const { crawler: empty, calls: emptyCalls } = build({ pages: { 1: '<html><body>점검 중</body></html>' } });
    expect(await empty.crawl('2026-11-10')).toMatchObject({ scanned: 0 });
    expect(emptyCalls.list).toEqual([1]);
  });

  it('대표 이미지 URL 이 설정돼 있으면 로고를 올리지 않는다', async () => {
    const { jobCrawlerConfig } = await import('../job-crawler.config');
    const previous = jobCrawlerConfig.incheon.imageUrl;
    jobCrawlerConfig.incheon.imageUrl = 'https://cdn.example.com/incheon.png';
    try {
      const { crawler, calls } = build();
      await crawler.crawl('2026-11-10');
      expect(calls.logo).toEqual([]);
      expect(calls.registrations[0].imageUrl).toBe('https://cdn.example.com/incheon.png');
    } finally {
      jobCrawlerConfig.incheon.imageUrl = previous;
    }
  });
});
