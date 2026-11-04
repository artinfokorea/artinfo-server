import * as fs from 'fs';
import * as path from 'path';
import { SeosanNoticeGateway, SeosanNoticeClient } from './seosan-notice.client';
import { SeosanChoirJobCrawler } from './seosan-choir-job.crawler';
import { JobSourceSupport, NoticeRegistration } from '../source/job-source.support';

/**
 * 스펙 (사이트는 가짜 게이트웨이, 등록·로고 업로드는 가짜 JobSourceSupport, 파서는 실제 픽스처):
 * 1) '시립합창단' 검색 결과 페이지를 1페이지로 두고 2025-09-05 를 돌리면 그날 행은 "서산시 시립합창단 단원 모집 공고" 1건
 *    → 상세(60500) → 공고문 hwp 다운로드 → 등록 요청 (단체명 서산시립합창단 · 주소 '충남 서산시 부춘공원2로 11' · 상세 '서산시립합창단' · 로고 업로드 URL · 본문)
 *    - 1페이지에 그날보다 오래된 행이 있으므로 2페이지는 읽지 않는다
 * 2) 같은 URL 이 이미 있으면 skipped (다운로드·등록 안 함)
 * 3) 실제 2026-11-04 목록(공고/고시 + 채용공고 1페이지, 그날 7건)에서 일반 공고로 올라온 '서산시 시립합창단 단원 모집 공고'(65950) 1건만 대상
 *    → 상세(65950) 의 hwpx 공고문을 내려받아 등록한다. 1페이지에 전날 행이 있으므로 2페이지는 읽지 않는다
 * 4) 다운로드 실패는 failed 로 모이고 나머지 흐름은 계속된다
 * 5) 검색 결과 9행이 모두 같은 날이면 합격자 공고 5건은 빼고 모집 4건(단원·예술감독·신규단원·반주자)만 대상이고, 다음 페이지가 비면 멈춘다
 * 6) 대표 이미지는 환경 변수 URL 이 있으면 그것, 없으면 JobSourceSupport.logoUrl 이 올린 URL
 */
const fixture = (name: string) => fs.readFileSync(path.join(__dirname, '__fixtures__', name), 'utf8');
const choirPage = fixture('list-choir-search.html');
const todayPage = fixture('list-2026-11-04-p1.html');
const LOGO = 'https://artinfo.s3.ap-northeast-2.amazonaws.com/prod/upload/42/jobs/logo/seosan.png';

function build(opts: { existing?: number; downloadError?: string; pages?: Record<number, string> } = {}) {
  const calls = { list: [] as number[], detail: [] as string[], download: [] as string[], logo: [] as string[], registrations: [] as NoticeRegistration[] };
  const gateway: SeosanNoticeGateway = {
    fetchListPage: async page => {
      calls.list.push(page);
      return opts.pages?.[page] ?? (page === 1 ? choirPage : '<html><body></body></html>');
    },
    fetchDetail: async mgtNo => {
      calls.detail.push(mgtNo);
      return fixture(mgtNo === '65950' ? 'detail-65950.html' : 'detail-60500.html');
    },
    downloadAttachment: async att => {
      calls.download.push(att.name);
      if (opts.downloadError) throw new Error(opts.downloadError);
      return Buffer.from('hwp');
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
      return { jobId: 999, title: input.title, url: input.url, attachment: input.file.name, pageCount: 2, majors: ['SOPRANO', 'BASS'] };
    },
  } as unknown as JobSourceSupport;
  const crawler = new SeosanChoirJobCrawler({} as SeosanNoticeClient, support, gateway);
  return { crawler, calls };
}

const NOTICE_URL =
  'https://www.seosan.go.kr/common/program/eminwonView.jsp?jndinm=OfrNotAncmtEJB&context=NTIS&method=selectOfrNotAncmt&methodnm=selectOfrNotAncmtRegst&homepage_pbs_yn=Y&subCheck=Y&not_ancmt_se_code=05&not_ancmt_mgt_no=60500';
const NOTICE_FILE = '서산시 시립합창단 단원 모집 공고.hwp';
const TITLE = '서산시 시립합창단 단원 모집 공고';

describe('SeosanChoirJobCrawler', () => {
  it('그날 채용 공고 1건을 내려받아 등록을 요청한다', async () => {
    const { crawler, calls } = build();
    const summary = await crawler.crawl('2025-09-05');

    expect(summary).toMatchObject({ source: 'seosan', sourceName: '서산시립합창단', date: '2025-09-05', scanned: 1, matched: 1, skipped: [], failed: [] });
    expect(summary.created).toEqual([{ jobId: 999, title: TITLE, url: NOTICE_URL, attachment: NOTICE_FILE, pageCount: 2, majors: ['SOPRANO', 'BASS'] }]);
    expect(calls.list).toEqual([1]);
    expect(calls.detail).toEqual(['60500']);
    expect(calls.download).toEqual([NOTICE_FILE]);
    expect(calls.logo).toEqual(['seosan:assets/job-crawler/seosan.png']);

    const reg = calls.registrations[0];
    expect(reg).toMatchObject({
      source: 'seosan',
      title: TITLE,
      url: NOTICE_URL,
      companyName: '서산시립합창단',
      address: '충남 서산시 부춘공원2로 11',
      addressDetail: '서산시립합창단',
      imageUrl: LOGO,
      date: '2025-09-05',
    });
    expect(reg.file.name).toBe(NOTICE_FILE);
    expect(reg.file.buffer.toString()).toBe('hwp');
    expect(reg.bodyText.startsWith('서산시에서는 시민의 정서 함양과')).toBe(true);
    expect(reg.bodyText).toContain('3. 접수기간: 2025. 9. 8.(월) ~ 9. 22.(월), 14일간');
  });

  it('같은 URL 이 이미 등록돼 있으면 건너뛴다', async () => {
    const { crawler, calls } = build({ existing: 5 });
    const summary = await crawler.crawl('2025-09-05');
    expect(summary.created).toEqual([]);
    expect(summary.skipped).toEqual([{ title: TITLE, url: NOTICE_URL, reason: '이미 등록됨 (job 5)' }]);
    expect(calls.download).toEqual([]);
    expect(calls.registrations).toEqual([]);
  });

  it('실제 2026-11-04 목록: 일반 공고로 올라온 시립합창단 단원 모집 공고 1건을 hwpx 로 등록한다', async () => {
    const { crawler, calls } = build({ pages: { 1: todayPage } });
    const summary = await crawler.crawl('2026-11-04');
    expect(summary.scanned).toBe(7);
    expect(summary.matched).toBe(1);
    expect(calls.list).toEqual([1]);
    expect(calls.detail).toEqual(['65950']);
    expect(calls.download).toEqual(['서산시 시립합창단 단원 모집 공고.hwpx']);
    expect(summary.created).toHaveLength(1);
    expect(calls.registrations[0]).toMatchObject({
      title: '서산시 시립합창단 단원 모집 공고',
      url: NOTICE_URL.replace('60500', '65950'),
      companyName: '서산시립합창단',
      date: '2026-11-04',
    });
    expect(calls.registrations[0].bodyText).toContain('신규 단원 모집 계획을 다음과 같이 공고합니다.');
  });

  it('다른 날짜면 아무것도 하지 않는다', async () => {
    const { crawler } = build();
    const summary = await crawler.crawl('2025-09-06');
    expect(summary.scanned).toBe(0);
    expect(summary.matched).toBe(0);
  });

  it('다운로드 실패는 failed 에 담긴다', async () => {
    const { crawler, calls } = build({ downloadError: '첨부파일 다운로드 실패' });
    const summary = await crawler.crawl('2025-09-05');
    expect(summary.failed).toEqual([{ title: TITLE, url: NOTICE_URL, reason: '첨부파일 다운로드 실패' }]);
    expect(calls.registrations).toEqual([]);
  });

  it('9행이 모두 같은 날이면 합격자 공고는 빼고 모집 4건만 대상이고, 다음 페이지가 비면 멈춘다', async () => {
    const sameDay = choirPage.replace(/\b20\d{2}-\d{2}-\d{2}\b/g, '2025-09-05');
    const { crawler, calls } = build({ pages: { 1: sameDay, 2: '<html><body></body></html>' } });
    const summary = await crawler.crawl('2025-09-05');
    expect(calls.list).toEqual([1, 2]);
    expect(summary.scanned).toBe(9);
    expect(summary.matched).toBe(4);
    expect(calls.detail).toEqual(['60500', '58220', '55880', '53671']);
  });

  it('대표 이미지 URL 이 설정돼 있으면 로고를 올리지 않고 그것을 쓴다', async () => {
    const { jobCrawlerConfig } = await import('../job-crawler.config');
    const original = jobCrawlerConfig.seosan.imageUrl;
    jobCrawlerConfig.seosan.imageUrl = 'https://example.com/seosan.png';
    try {
      const { crawler, calls } = build();
      await crawler.crawl('2025-09-05');
      expect(calls.logo).toEqual([]);
      expect(calls.registrations[0].imageUrl).toBe('https://example.com/seosan.png');
    } finally {
      jobCrawlerConfig.seosan.imageUrl = original;
    }
  });
});
