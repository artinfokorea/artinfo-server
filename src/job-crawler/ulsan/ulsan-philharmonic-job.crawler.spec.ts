import * as fs from 'fs';
import * as path from 'path';
import { UlsanNoticeGateway, UlsanNoticeClient } from './ulsan-notice.client';
import { UlsanPhilharmonicJobCrawler } from './ulsan-philharmonic-job.crawler';
import { JobSourceSupport, NoticeRegistration } from '../source/job-source.support';

/**
 * 스펙 (사이트는 가짜 게이트웨이, 등록은 가짜 JobSourceSupport, 파서는 실제 픽스처):
 * 1) 2026-10-06 목록 1페이지(고정 공지 5 + 일반 10, 그날 일반 5건) 중 "…시립교향악단 … 모집" 1건 → 공고문 hwp 다운로드 → 등록 요청
 *    - 합격자 공고 2건(교향악단·청소년교향악단) · 합창단 · 합창 대축제는 대상이 아니다
 *    - 제목 · 단체명 울산시립교향악단 · 주소 '울산 남구 번영로 200' · 상세 '울산문화예술회관 시립교향악단' · 대표 이미지 URL · URL · 본문
 *    - 1페이지에 전날보다 오래된 일반 행이 있으므로 2페이지는 읽지 않는다
 * 2) 같은 URL 이 이미 있으면 skipped (다운로드·등록 안 함)
 * 3) 다른 날짜면 scanned 0 · matched 0 (고정 공지는 날짜가 달라도 멈춤 판정에 안 쓴다)
 * 4) 다운로드 실패는 failed 로 모이고 나머지 흐름은 계속된다
 * 5) 1페이지 일반 행이 모두 그날이면 2페이지를 읽고, 전날 행이 나오면 멈춘다. 매 페이지 반복되는 고정 공지는 한 번만 센다
 * 6) 그날 고정 공지가 채용 공고면 대상에 든다
 */
const fixture = (name: string) => fs.readFileSync(path.join(__dirname, '__fixtures__', name), 'utf8');
const page1 = fixture('list-2026-10-06-p1.html');
const page2 = fixture('list-2026-10-06-p2.html');
/** 1페이지 일반 행이 모두 그날 (10-06 이 아닌 일반 행 날짜를 10-06 으로) */
const fullTodayPage = page1.replace(/2026-09-21|2026-08-26|2026-08-18|2026-08-14|2026-07-30/g, '2026-10-06');

function build(opts: { existing?: number; downloadError?: string; pages?: Record<number, string> } = {}) {
  const calls = { list: [] as number[], detail: [] as string[], download: [] as string[], registrations: [] as NoticeRegistration[] };
  const gateway: UlsanNoticeGateway = {
    fetchListPage: async page => {
      calls.list.push(page);
      return opts.pages?.[page] ?? (page === 1 ? page1 : page2);
    },
    fetchDetail: async bodSn => {
      calls.detail.push(bodSn);
      return {
        url: `https://www.ulsan.go.kr/ucac/art/page.do?mnu_code=mnu003001&bod_sn=${bodSn}&cmd=2`,
        html: fixture('detail-163.html'),
        cookies: ['JSESSIONID=1'],
      };
    },
    downloadAttachment: async (_page, att) => {
      calls.download.push(att.name);
      if (opts.downloadError) throw new Error(opts.downloadError);
      return Buffer.from('hwp');
    },
  };
  const support = {
    findRegisteredJobId: async () => opts.existing ?? null,
    register: async (input: NoticeRegistration) => {
      calls.registrations.push(input);
      return {
        jobId: 888,
        title: input.title,
        url: input.url,
        attachment: input.file.name,
        pageCount: 4,
        majors: ['TRUMPET', 'TROMBONE', 'BASSOON', 'CLARINET'],
      };
    },
  } as unknown as JobSourceSupport;
  const crawler = new UlsanPhilharmonicJobCrawler({} as UlsanNoticeClient, support, gateway);
  return { crawler, calls };
}

const NOTICE_URL = 'https://www.ulsan.go.kr/ucac/art/page.do?mnu_code=mnu003001&bod_sn=163&cmd=2';
const NOTICE_FILE = '울산광역시문화예술회관 공고_울산시립교향악단 수차석단원 공개모집(변경).hwp';

describe('UlsanPhilharmonicJobCrawler', () => {
  it('그날 채용 공고 1건을 내려받아 등록을 요청한다', async () => {
    const { crawler, calls } = build();
    const summary = await crawler.crawl('2026-10-06');

    expect(summary).toMatchObject({ source: 'ulsan', sourceName: '울산시립교향악단', date: '2026-10-06', scanned: 5, matched: 1, skipped: [], failed: [] });
    expect(summary.created).toEqual([
      {
        jobId: 888,
        title: '울산시립교향악단 수·차석단원 공개모집 변경 공고',
        url: NOTICE_URL,
        attachment: NOTICE_FILE,
        pageCount: 4,
        majors: ['TRUMPET', 'TROMBONE', 'BASSOON', 'CLARINET'],
      },
    ]);
    expect(calls.list).toEqual([1]);
    expect(calls.detail).toEqual(['163']);
    expect(calls.download).toEqual([NOTICE_FILE]);

    const reg = calls.registrations[0];
    expect(reg).toMatchObject({
      source: 'ulsan',
      title: '울산시립교향악단 수·차석단원 공개모집 변경 공고',
      url: NOTICE_URL,
      companyName: '울산시립교향악단',
      address: '울산 남구 번영로 200',
      addressDetail: '울산문화예술회관 시립교향악단',
      imageUrl: 'https://artinfo.s3.ap-northeast-2.amazonaws.com/prod/upload/4637/images/20261024/original/0T1newl6ktY.1792829663169.png',
      date: '2026-10-06',
    });
    expect(reg.file.name).toBe(NOTICE_FILE);
    expect(reg.file.buffer.toString()).toBe('hwp');
    expect(reg.bodyText.startsWith('울산시립교향악단 수·차석단원 모집을 다음과 같이 변경 공고합니다.')).toBe(true);
  });

  it('같은 URL 이 이미 등록돼 있으면 건너뛴다', async () => {
    const { crawler, calls } = build({ existing: 5 });
    const summary = await crawler.crawl('2026-10-06');
    expect(summary.created).toEqual([]);
    expect(summary.skipped).toEqual([{ title: '울산시립교향악단 수·차석단원 공개모집 변경 공고', url: NOTICE_URL, reason: '이미 등록됨 (job 5)' }]);
    expect(calls.download).toEqual([]);
    expect(calls.registrations).toEqual([]);
  });

  it('다른 날짜면 아무것도 하지 않는다', async () => {
    const { crawler, calls } = build();
    const summary = await crawler.crawl('2026-10-07');
    expect(summary.scanned).toBe(0);
    expect(summary.matched).toBe(0);
    expect(calls.list).toEqual([1]);
    expect(calls.registrations).toEqual([]);
  });

  it('다운로드 실패는 failed 에 담긴다', async () => {
    const { crawler, calls } = build({ downloadError: '첨부파일 다운로드 실패' });
    const summary = await crawler.crawl('2026-10-06');
    expect(summary.failed).toEqual([{ title: '울산시립교향악단 수·차석단원 공개모집 변경 공고', url: NOTICE_URL, reason: '첨부파일 다운로드 실패' }]);
    expect(calls.registrations).toEqual([]);
  });

  it('1페이지 일반 행이 모두 그날이면 2페이지를 읽고 전날 행이 나오면 멈춘다 — 고정 공지는 멈춤 판정에 안 쓴다', async () => {
    const { crawler, calls } = build({ pages: { 1: fullTodayPage, 2: page2 } });
    const summary = await crawler.crawl('2026-10-06');
    expect(summary.scanned).toBe(10);
    expect(calls.list).toEqual([1, 2]);
  });

  it('그날 올라온 고정 공지가 채용 공고면 대상에 들고 페이지가 반복돼도 한 번만 센다', async () => {
    // 고정 공지 '2027년 상반기 울산문화예술회관 정기대관 공고'(bod_sn 235, 08-21) 를 그날 교향악단 채용 공고로 바꾼다
    const pin = (html: string) =>
      html.replace(/2027년 상반기 울산문화예술회관 정기대관 공고/g, '울산광역시립교향악단 단원 채용 공고').replace(/2026-08-21/g, '2026-10-06');
    const { crawler, calls } = build({ pages: { 1: pin(fullTodayPage), 2: pin(page2) } });
    const summary = await crawler.crawl('2026-10-06');
    expect(calls.list).toEqual([1, 2]);
    expect(summary.scanned).toBe(11);
    expect(summary.matched).toBe(2);
    expect(calls.detail).toEqual(['235', '163']);
  });

  it('일반 행이 없는 빈 페이지가 나오면 멈춘다', async () => {
    const onlyPinned = page2.replace(/<tr>\s*<td class="w_top">\s*\d+<\/td>[\s\S]*?<\/tr>/g, '');
    const { crawler, calls } = build({ pages: { 1: fullTodayPage, 2: onlyPinned } });
    const summary = await crawler.crawl('2026-10-06');
    expect(calls.list).toEqual([1, 2]);
    expect(summary.scanned).toBe(10);
  });
});
