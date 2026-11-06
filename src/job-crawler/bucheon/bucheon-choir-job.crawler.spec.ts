import * as fs from 'fs';
import * as path from 'path';
import { BucheonNoticeGateway, BucheonNoticeClient } from './bucheon-notice.client';
import { BucheonChoirJobCrawler } from './bucheon-choir-job.crawler';
import { JobSourceSupport, NoticeRegistration } from '../source/job-source.support';

/**
 * 스펙 (사이트는 가짜 게이트웨이, 등록·로고 업로드는 가짜 JobSourceSupport, 파서·ZIP 읽기는 실제 픽스처):
 * 1) 2026-11-04: 공지사항 1페이지(10행, 그날 1건 "[공고] 부천시립합창단 상임단원 채용 공고") + 단원채용 1페이지(그날 0건) → 1건 대상
 *    - 첨부는 zip 하나 → 상세 URL 을 Referer 로 받아 안에서 '…채용 공고문.pdf' 를 골라 등록 요청 (서식 hwpx · 지정곡 pdf 는 아님)
 *    - 제목 · 단체명 부천시립합창단 · 주소 '경기 부천시 원미구 소향로 165' · 상세 '부천시립예술단' · 대표 이미지(로고 업로드 URL) · URL · 본문(없음)
 *    - 두 게시판 모두 1페이지에 전날보다 오래된 행이 있어 2페이지는 읽지 않는다
 * 2) zip 안에 공고문이 없으면(서식·지정곡만) 본문 이미지 7장을 받아 images 로 등록한다 (file 없음)
 * 3) zip 다운로드가 실패해도 본문 이미지가 있으면 이미지로 등록하고, 이미지도 없으면 failed
 * 4) 같은 URL 이 이미 있으면 skipped (다운로드·등록 안 함)
 * 5) 다른 날짜면 scanned 0 · matched 0
 * 6) 같은 날이라도 '해설음악회 앵콜곡 안내' · '최종합격자 공고' 는 대상이 아니다
 * 7) 단원채용 게시판 글도 같은 날이면 대상 — 본문(접수기간 · 베이스 상임단원 1명)과 함께 등록. 두 게시판 글은 URL 이 달라 각각 등록된다
 * 8) 1페이지 행이 모두 그날이면 2페이지를 읽는다
 * 9) 대표 이미지는 환경 변수 URL 이 있으면 그것, 없으면 JobSourceSupport.logoUrl 이 올린 URL
 */
const fixture = (name: string) => fs.readFileSync(path.join(__dirname, '__fixtures__', name), 'utf8');
const zipFixture = (name: string) => fs.readFileSync(path.join(__dirname, '..', 'source', '__fixtures__', name));
const LOGO = 'https://artinfo.s3.ap-northeast-2.amazonaws.com/prod/upload/42/jobs/logo/bucheon.png';

function build(opts: { existing?: number; zip?: Buffer; zipError?: string; pages?: Record<string, string> } = {}) {
  const calls = {
    list: [] as string[],
    detail: [] as string[],
    download: [] as string[],
    referers: [] as string[],
    logo: [] as string[],
    registrations: [] as NoticeRegistration[],
  };
  const gateway: BucheonNoticeGateway = {
    fetchListPage: async (board, page) => {
      calls.list.push(`${board}:${page}`);
      return opts.pages?.[`${board}:${page}`] ?? fixture(`${board}-list-2026-11-05-p${page}.html`);
    },
    fetchDetail: async row => {
      calls.detail.push(row.id);
      return fixture(row.board === 'article' ? 'article-detail-AT026086.html' : 'recruit-detail-RM000035.html');
    },
    download: async (url, referer) => {
      calls.download.push(url);
      calls.referers.push(referer);
      if (url.includes('/file/download.do')) {
        if (opts.zipError) throw new Error(opts.zipError);
        return opts.zip ?? zipFixture('sample.zip');
      }
      return Buffer.from(`png:${url.slice(url.lastIndexOf('/') + 1)}`);
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
        pageCount: input.file ? 7 : (input.images?.length ?? 0),
        majors: [],
      };
    },
  } as unknown as JobSourceSupport;
  const crawler = new BucheonChoirJobCrawler({} as BucheonNoticeClient, support, gateway);
  return { crawler, calls };
}

const ARTICLE_URL = 'https://www.bucheonphil.or.kr/front/M0000025/article/view.do?atcId=AT026086';
const ARTICLE_ZIP = 'https://www.bucheonphil.or.kr/file/download.do?fileId=FS018179';
const ARTICLE_TITLE = '[공고] 부천시립합창단 상임단원 채용 공고';
const RECRUIT_URL = 'https://www.bucheonphil.or.kr/front/M0000061/recruit/view.do?rcrtId=RM000035';
const RECRUIT_ZIP = 'https://www.bucheonphil.or.kr/file/download.do?fileId=FS017927';
const NOTICE_PDF = '부천시립합창단 상임단원 채용 공고문.pdf';
const IMAGE_URLS = ['1793770401025', '1793770426038', '1793770430951', '1793770435327', '1793770445472', '1793770449918', '1793770454709'].map(
  id => `https://www.bucheonphil.or.kr/upload/ckeditor/${id}.png`,
);
const recruitSameDay = () => fixture('recruit-list-2026-11-05-p1.html').replace('2026-06-01', '2026-11-04');

describe('BucheonChoirJobCrawler', () => {
  it('그날 채용 공고 1건 — zip 첨부 안의 공고문 pdf 를 골라 등록을 요청한다', async () => {
    const { crawler, calls } = build();
    const summary = await crawler.crawl('2026-11-04');

    expect(summary).toMatchObject({ source: 'bucheon', sourceName: '부천시립합창단', date: '2026-11-04', scanned: 1, matched: 1, skipped: [], failed: [] });
    expect(summary.created).toEqual([{ jobId: 999, title: ARTICLE_TITLE, url: ARTICLE_URL, attachment: NOTICE_PDF, pageCount: 7, majors: [] }]);
    expect(calls.list).toEqual(['article:1', 'recruit:1']);
    expect(calls.detail).toEqual(['AT026086']);
    expect(calls.download).toEqual([ARTICLE_ZIP]);
    expect(calls.referers).toEqual([ARTICLE_URL]);
    expect(calls.logo).toEqual(['bucheon:assets/job-crawler/bucheon.png']);

    const reg = calls.registrations[0];
    expect(reg).toMatchObject({
      source: 'bucheon',
      title: ARTICLE_TITLE,
      url: ARTICLE_URL,
      bodyText: '',
      companyName: '부천시립합창단',
      address: '경기 부천시 원미구 소향로 165',
      addressDetail: '부천시립예술단',
      imageUrl: LOGO,
      date: '2026-11-04',
      images: [],
    });
    expect(reg.file?.name).toBe(NOTICE_PDF);
    expect(reg.file?.buffer.toString()).toBe('%PDF-1.4 notice '.repeat(20));
  });

  it('zip 안에 공고문이 없으면 본문 이미지 7장으로 등록한다', async () => {
    const { crawler, calls } = build({ zip: zipFixture('forms-only.zip') });
    const summary = await crawler.crawl('2026-11-04');

    expect(summary.failed).toEqual([]);
    expect(summary.created).toEqual([{ jobId: 999, title: ARTICLE_TITLE, url: ARTICLE_URL, attachment: '본문 이미지 7장', pageCount: 7, majors: [] }]);
    expect(calls.download).toEqual([ARTICLE_ZIP, ...IMAGE_URLS]);
    expect(new Set(calls.referers)).toEqual(new Set([ARTICLE_URL]));
    const reg = calls.registrations[0];
    expect(reg.file).toBeUndefined();
    expect(reg.images?.map(i => i.name)).toEqual(IMAGE_URLS.map(u => u.slice(u.lastIndexOf('/') + 1)));
    expect(reg.images?.[0].buffer.toString()).toBe('png:1793770401025.png');
  });

  it('zip 다운로드가 실패해도 본문 이미지가 있으면 이미지로 등록한다', async () => {
    const { crawler, calls } = build({ zipError: '다운로드 실패: text/html' });
    const summary = await crawler.crawl('2026-11-04');
    expect(summary.failed).toEqual([]);
    expect(summary.created[0].attachment).toBe('본문 이미지 7장');
    expect(calls.download).toEqual([ARTICLE_ZIP, ...IMAGE_URLS]);
  });

  it('zip 다운로드가 실패하고 본문 이미지도 없으면 failed', async () => {
    const { crawler, calls } = build({
      zipError: '다운로드 실패: text/html',
      pages: { 'article:1': fixture('article-list-2026-11-05-p2.html'), 'recruit:1': recruitSameDay() },
    });
    const summary = await crawler.crawl('2026-11-04');
    expect(summary.scanned).toBe(1);
    expect(summary.created).toEqual([]);
    expect(summary.failed).toEqual([{ title: '부천시립합창단 단원 채용', url: RECRUIT_URL, reason: '다운로드 실패: text/html' }]);
    expect(calls.registrations).toEqual([]);
  });

  it('같은 URL 이 이미 등록돼 있으면 건너뛴다', async () => {
    const { crawler, calls } = build({ existing: 5 });
    const summary = await crawler.crawl('2026-11-04');
    expect(summary.created).toEqual([]);
    expect(summary.skipped).toEqual([{ title: ARTICLE_TITLE, url: ARTICLE_URL, reason: '이미 등록됨 (job 5)' }]);
    expect(calls.download).toEqual([]);
    expect(calls.registrations).toEqual([]);
  });

  it('다른 날짜면 아무것도 하지 않는다', async () => {
    const { crawler, calls } = build();
    const summary = await crawler.crawl('2026-11-03');
    expect(summary.scanned).toBe(0);
    expect(summary.matched).toBe(0);
    expect(calls.list).toEqual(['article:1', 'recruit:1']);
    expect(calls.registrations).toEqual([]);
  });

  it('해설음악회 앵콜곡 안내 · 최종합격자 공고는 같은 날이어도 대상이 아니다', async () => {
    const sameDay = fixture('article-list-2026-11-05-p1.html').replace(/2026-11-05|2026-07-09/g, '2026-11-04');
    const { crawler, calls } = build({ pages: { 'article:1': sameDay } });
    const summary = await crawler.crawl('2026-11-04');
    expect(summary.scanned).toBe(3);
    expect(summary.matched).toBe(1);
    expect(calls.detail).toEqual(['AT026086']);
  });

  it('단원채용 게시판 글도 같은 날이면 본문과 함께 등록한다 — 두 게시판 글은 각각 등록', async () => {
    const { crawler, calls } = build({ pages: { 'recruit:1': recruitSameDay() } });
    const summary = await crawler.crawl('2026-11-04');

    expect(summary.scanned).toBe(2);
    expect(summary.matched).toBe(2);
    expect(summary.created.map(c => c.url)).toEqual([ARTICLE_URL, RECRUIT_URL]);
    expect(calls.detail).toEqual(['AT026086', 'RM000035']);
    expect(calls.download).toEqual([ARTICLE_ZIP, RECRUIT_ZIP]);
    expect(calls.referers).toEqual([ARTICLE_URL, RECRUIT_URL]);

    const reg = calls.registrations[1];
    expect(reg).toMatchObject({ title: '부천시립합창단 단원 채용', url: RECRUIT_URL, companyName: '부천시립합창단', images: [] });
    expect(reg.file?.name).toBe(NOTICE_PDF);
    expect(reg.bodyText.startsWith('접수기간: 2026-06-01 09:00 ~ 2026-06-10 17:00')).toBe(true);
    expect(reg.bodyText).toContain('■ 채용분야 및 인원 : 베이스 상임단원 1명');
  });

  it('1페이지 행이 모두 그날이면 2페이지를 읽는다', async () => {
    const allToday = fixture('article-list-2026-11-05-p1.html').replace(/<td class="date">\d{4}-\d{2}-\d{2}<\/td>/g, '<td class="date">2026-11-04</td>');
    const { crawler, calls } = build({ pages: { 'article:1': allToday } });
    const summary = await crawler.crawl('2026-11-04');
    expect(calls.list).toEqual(['article:1', 'article:2', 'recruit:1']);
    expect(summary.scanned).toBe(10);
    // 채용 공고 1건만 대상 (합격자 공고 2건 · 안내 글은 제외)
    expect(summary.matched).toBe(1);
  });
});
