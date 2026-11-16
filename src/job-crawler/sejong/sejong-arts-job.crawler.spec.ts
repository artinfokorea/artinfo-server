import * as fs from 'fs';
import * as path from 'path';
import { SejongNoticeClient, SejongNoticeGateway } from './sejong-notice.client';
import { SejongArtsJobCrawler } from './sejong-arts-job.crawler';
import { JobSourceSupport, NoticeRegistration } from '../source/job-source.support';

/**
 * 스펙 (사이트는 가짜 게이트웨이, 등록·로고 업로드는 가짜 JobSourceSupport, 파서는 실제 픽스처):
 * 1) 2026-11-10: 1페이지에서 그날 글 "2026 서울시예술단 일반단원 공개채용 공고"(50240) 1건
 *    → 첨부는 세부사항·가점·악보뿐이라 공고문 첨부 없음 → 본문 이미지(career.co.kr jpg) 1장을 받아 images 로, 본문 글은 bodyText 로 등록 요청
 *    - 단체명 서울시예술단 · 주소 '서울 종로구 세종대로 175' · 상세 '세종문화회관' · 대표 이미지(로고 업로드 URL) · URL
 *    - 1페이지 나머지 행이 그날보다 오래됐으므로 2페이지는 읽지 않는다
 * 2) 2026-09-29: 예술단 직책단원(50176) 1건 — 본문이 incruit 그림 한 장뿐 → 그 이미지로 등록, bodyText ''
 * 3) '공고' 가 든 HWPX 첨부가 있으면 그것을 받아 file 로 등록하고 본문 이미지는 받지 않는다
 * 4) 본문 이미지도 공고 첨부도 없으면 보조 문서(세부사항 hwpx) 를 file 로 쓴다; 그것도 없으면 skipped
 * 5) 같은 URL 이 이미 있으면 skipped (다운로드·등록 안 함)
 * 6) 다른 날짜면 scanned 0 · matched 0
 * 7) 다운로드 실패는 failed 로 모이고 예외를 올리지 않는다
 * 8) 같은 날짜라도 계약직 직원(11-02) · 안내원 모집(10-02) · 뮤지컬단 아역 오디션(07-08) · 청소년국악단(06-11) 은 대상이 아니고,
 *    예술단 일반단원(육아휴직대체)(04-03) 은 대상이다
 * 9) 1페이지가 모두 그날이면 2페이지를 읽고, 행이 없으면 멈춘다
 * 10) 대표 이미지는 환경 변수 URL 이 있으면 그것, 없으면 JobSourceSupport.logoUrl 이 올린 URL
 */
const fixture = (name: string) => fs.readFileSync(path.join(__dirname, '__fixtures__', name), 'utf8');
const page1 = fixture('list-2026-11-16-p1.html');
const page2 = fixture('list-2026-11-16-p2.html');
const LOGO = 'https://artinfo.s3.ap-northeast-2.amazonaws.com/prod/upload/42/jobs/logo/sejong.png';
const NOTICE_HWPX =
  '<li><a href="/portal/cmmn/file/fileDown.do?atchFileId=zzz&amp;fileSn=9&amp;bbsId=B0000065">2026 서울시예술단 단원 모집 공고문.hwpx</a></li>';

function build(opts: { existing?: number; downloadError?: string; pages?: Record<number, string>; detail?: Record<string, string> } = {}) {
  const calls = {
    list: [] as number[],
    detail: [] as string[],
    download: [] as string[],
    referers: [] as string[],
    logo: [] as string[],
    registrations: [] as NoticeRegistration[],
  };
  const gateway: SejongNoticeGateway = {
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
      return Buffer.from(url.includes('fileDown.do') ? `doc:${url.slice(-20)}` : `img:${url.slice(url.lastIndexOf('/') + 1)}`);
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
        pageCount: (input.file ? 2 : 0) + (input.images?.length ?? 0),
        majors: [],
      };
    },
  } as unknown as JobSourceSupport;
  const crawler = new SejongArtsJobCrawler({} as SejongNoticeClient, support, gateway);
  return { crawler, calls };
}

const URL_50240 = 'https://www.sejongpac.or.kr/portal/bbs/B0000065/view.do?nttId=50240&menuNo=200571';
const URL_50176 = 'https://www.sejongpac.or.kr/portal/bbs/B0000065/view.do?nttId=50176&menuNo=200571';
const IMAGE_50240 = 'https://job3.career.co.kr/ci/202600/images/spac_261030001.jpg';
const IMAGE_50176 = 'https://c.incru.it/biz_file/2026/09/biz_1_20260929093855371.png';
const TITLE_50240 = '2026 서울시예술단 일반단원 공개채용 공고';
const TITLE_50176 = '(재)세종문화회관 예술단 직책단원(극단 지도위원, 소년소녀합창 연습지휘자) 공개채용 공고';

describe('SejongArtsJobCrawler', () => {
  it('그날 올라온 일반단원 공고 1건을 본문 이미지 + 본문 글로 등록 요청한다', async () => {
    const { crawler, calls } = build();
    const summary = await crawler.crawl('2026-11-10');

    expect(summary).toMatchObject({ source: 'sejong', sourceName: '서울시예술단', date: '2026-11-10', scanned: 1, matched: 1, skipped: [], failed: [] });
    expect(summary.created).toEqual([{ jobId: 999, title: TITLE_50240, url: URL_50240, attachment: '본문 이미지 1장', pageCount: 1, majors: [] }]);
    expect(calls.list).toEqual([1]);
    expect(calls.detail).toEqual(['50240']);
    expect(calls.download).toEqual([IMAGE_50240]);
    expect(calls.referers).toEqual([URL_50240]);
    expect(calls.logo).toEqual(['sejong:assets/job-crawler/sejong.png']);

    const reg = calls.registrations[0];
    expect(reg).toMatchObject({
      source: 'sejong',
      title: TITLE_50240,
      url: URL_50240,
      companyName: '서울시예술단',
      address: '서울 종로구 세종대로 175',
      addressDetail: '세종문화회관',
      imageUrl: LOGO,
      date: '2026-11-10',
    });
    expect(reg.file).toBeUndefined();
    expect(reg.images).toEqual([{ name: 'spac_261030001.jpg', buffer: Buffer.from('img:spac_261030001.jpg') }]);
    expect(reg.bodyText.split('\n')[0]).toBe('1 채용개요');
    expect(reg.bodyText).toContain('서울시무용단 (일반단원) | 무용 | 5명');
    expect(reg.bodyHtml).toContain('<figure class="table"><table>');
    expect(reg.bodyHtml).toContain('<td rowspan="3">');
  });

  it('본문이 그림 한 장뿐인 직책단원 공고는 그 이미지로 등록하고 bodyText 는 비어 있다', async () => {
    const { crawler, calls } = build();
    const summary = await crawler.crawl('2026-09-29');
    expect(summary).toMatchObject({ scanned: 1, matched: 1, skipped: [], failed: [] });
    expect(calls.detail).toEqual(['50176']);
    expect(calls.download).toEqual([IMAGE_50176]);
    expect(calls.registrations[0]).toMatchObject({ title: TITLE_50176, url: URL_50176, bodyText: '', bodyHtml: '' });
    expect(calls.registrations[0].images).toEqual([{ name: 'biz_1_20260929093855371.png', buffer: Buffer.from('img:biz_1_20260929093855371.png') }]);
    expect(calls.registrations[0].file).toBeUndefined();
  });

  it("'공고' HWPX 첨부가 있으면 그것을 받아 file 로 등록하고 본문 이미지는 받지 않는다", async () => {
    const withHwpx = fixture('detail-50240.html').replace('<ul class="file_list">', `<ul class="file_list">${NOTICE_HWPX}`);
    const { crawler, calls } = build({ detail: { '50240': withHwpx } });
    const summary = await crawler.crawl('2026-11-10');
    expect(summary.created).toEqual([expect.objectContaining({ attachment: '2026 서울시예술단 단원 모집 공고문.hwpx', pageCount: 2 })]);
    expect(calls.download).toEqual(['https://www.sejongpac.or.kr/portal/cmmn/file/fileDown.do?atchFileId=zzz&fileSn=9&bbsId=B0000065']);
    expect(calls.registrations[0].file?.name).toBe('2026 서울시예술단 단원 모집 공고문.hwpx');
    expect(calls.registrations[0].images).toEqual([]);
  });

  it('본문 이미지가 없으면 보조 문서(세부사항 hwpx) 를 file 로 쓰고, 그것도 없으면 건너뛴다', async () => {
    const noImage = fixture('detail-50240.html').replace(/<img [^>]*career\.co\.kr[^>]*>/, '');
    const { crawler, calls } = build({ detail: { '50240': noImage } });
    const summary = await crawler.crawl('2026-11-10');
    expect(summary.created).toEqual([expect.objectContaining({ attachment: '채용분야별 실기전형 세부사항.hwpx', pageCount: 2 })]);
    expect(calls.download).toEqual([
      'https://www.sejongpac.or.kr/portal/cmmn/file/fileDown.do?atchFileId=b67e2cdffd554e00b209d32e6636fe65&fileSn=1&bbsId=B0000065',
    ]);
    expect(calls.registrations[0].bodyText).toContain('1 채용개요');

    const nothing = noImage.replace(/<ul class="file_list">[\s\S]*?<\/ul>/, '<ul class="file_list"></ul>');
    const { crawler: c2, calls: calls2 } = build({ detail: { '50240': nothing } });
    const summary2 = await c2.crawl('2026-11-10');
    expect(summary2.created).toEqual([]);
    expect(summary2.skipped).toEqual([{ title: TITLE_50240, url: URL_50240, reason: '공고문이 없음 (첨부 0개, 본문 이미지 0장)' }]);
    expect(calls2.download).toEqual([]);
  });

  it('이미 등록된 공고는 건너뛴다', async () => {
    const { crawler, calls } = build({ existing: 123 });
    const summary = await crawler.crawl('2026-11-10');
    expect(summary.created).toEqual([]);
    expect(summary.skipped).toEqual([{ title: TITLE_50240, url: URL_50240, reason: '이미 등록됨 (job 123)' }]);
    expect(calls.detail).toEqual([]);
    expect(calls.download).toEqual([]);
  });

  it('그날 올라온 글이 없으면 아무것도 하지 않는다', async () => {
    const { crawler, calls } = build();
    const summary = await crawler.crawl('2026-11-16');
    expect(summary).toMatchObject({ scanned: 0, matched: 0, created: [], skipped: [], failed: [] });
    expect(calls.list).toEqual([1]);
    expect(calls.detail).toEqual([]);
  });

  it('다운로드가 실패하면 failed 에 담고 예외를 올리지 않는다', async () => {
    const { crawler } = build({ downloadError: '다운로드 실패: x' });
    const summary = await crawler.crawl('2026-11-10');
    expect(summary.created).toEqual([]);
    expect(summary.failed).toEqual([{ title: TITLE_50240, url: URL_50240, reason: '다운로드 실패: x' }]);
  });

  it('계약직 직원 · 안내원 · 아역 오디션 · 청소년국악단은 대상이 아니고, 예술단 일반단원(육아휴직대체) 은 대상이다', async () => {
    const { crawler, calls } = build();
    expect(await crawler.crawl('2026-11-02')).toMatchObject({ scanned: 1, matched: 0 });
    expect(await crawler.crawl('2026-10-02')).toMatchObject({ scanned: 1, matched: 0 });
    expect(calls.detail).toEqual([]);

    const { crawler: b, calls: callsB } = build({ pages: { 1: page2 } });
    expect(await b.crawl('2026-07-08')).toMatchObject({ scanned: 1, matched: 0 });
    expect(await b.crawl('2026-06-11')).toMatchObject({ scanned: 1, matched: 0 });
    expect(callsB.detail).toEqual([]);
    const summary = await b.crawl('2026-04-03');
    expect(summary).toMatchObject({ scanned: 1, matched: 1 });
    expect(callsB.detail).toEqual(['49954']);
    expect(summary.failed).toEqual([]);
  });

  it('1페이지가 모두 그날이면 2페이지를 읽고, 행이 없으면 멈춘다', async () => {
    const allToday = page1.replace(/\d{4}-\d{2}-\d{2}/g, '2026-11-10');
    const { crawler, calls } = build({ pages: { 1: allToday, 2: page2 } });
    const summary = await crawler.crawl('2026-11-10');
    expect(calls.list).toEqual([1, 2]);
    expect(summary.scanned).toBe(10);

    const { crawler: empty, calls: emptyCalls } = build({ pages: { 1: '<html><body>점검 중</body></html>' } });
    expect(await empty.crawl('2026-11-10')).toMatchObject({ scanned: 0 });
    expect(emptyCalls.list).toEqual([1]);
  });

  it('대표 이미지 URL 이 설정돼 있으면 로고를 올리지 않는다', async () => {
    const { jobCrawlerConfig } = await import('../job-crawler.config');
    const previous = jobCrawlerConfig.sejong.imageUrl;
    jobCrawlerConfig.sejong.imageUrl = 'https://cdn.example.com/sejong.png';
    try {
      const { crawler, calls } = build();
      await crawler.crawl('2026-11-10');
      expect(calls.logo).toEqual([]);
      expect(calls.registrations[0].imageUrl).toBe('https://cdn.example.com/sejong.png');
    } finally {
      jobCrawlerConfig.sejong.imageUrl = previous;
    }
  });
});
