import * as fs from 'fs';
import * as path from 'path';
import { BoryeongNoticeGateway, BoryeongNoticeClient } from './boryeong-notice.client';
import { BoryeongChoirJobCrawler } from './boryeong-choir-job.crawler';
import { JobSourceSupport, NoticeRegistration } from '../source/job-source.support';

/**
 * 스펙 (사이트는 가짜 게이트웨이, 등록·로고 업로드는 가짜 JobSourceSupport, 파서는 실제 픽스처):
 * 1) 2026-10-27 목록 1페이지(고정 공지 5 + 일반 10, 그날 일반 1건) 중 "…보령시립합창단 … 모집" 1건 → 공고문 hwpx 다운로드 → 등록 요청
 *    - 제목 · 단체명 보령시립합창단 · 주소 '충남 보령시 성주산로 101' · 상세 '보령문화예술회관' · 대표 이미지(로고 업로드 URL) · URL · 본문
 *    - 1페이지에 전날보다 오래된 일반 행이 있으므로 2페이지는 읽지 않는다
 * 2) 같은 URL 이 이미 있으면 skipped (다운로드·등록 안 함)
 * 3) 다른 날짜면 scanned 0 · matched 0
 * 4) 다운로드 실패는 failed 로 모이고 나머지 흐름은 계속된다
 * 5) 같은 날짜라도 '소년소녀합창단 정기연주회' · '최종합격자 알림' 은 대상이 아니다
 * 6) 1페이지 일반 행이 모두 그날이면 2페이지를 읽고, 일반 행이 없으면 멈춘다 (고정 공지는 한 번만 센다)
 * 7) 대표 이미지는 환경 변수 URL 이 있으면 그것, 없으면 JobSourceSupport.logoUrl 이 올린 URL
 */
const fixture = (name: string) => fs.readFileSync(path.join(__dirname, '__fixtures__', name), 'utf8');
const page1 = fixture('list-2026-10-27-p1.html');
const page2 = fixture('list-2026-10-27-p2.html');
const LOGO = 'https://artinfo.s3.ap-northeast-2.amazonaws.com/prod/upload/42/jobs/logo/boryeong.png';

function build(opts: { existing?: number; downloadError?: string; pages?: Record<number, string> } = {}) {
  const calls = { list: [] as number[], detail: [] as string[], download: [] as string[], logo: [] as string[], registrations: [] as NoticeRegistration[] };
  const gateway: BoryeongNoticeGateway = {
    fetchListPage: async page => {
      calls.list.push(page);
      return opts.pages?.[page] ?? (page === 1 ? page1 : page2);
    },
    fetchDetail: async nttId => {
      calls.detail.push(nttId);
      return fixture('detail-199082.html');
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
      return { jobId: 999, title: input.title, url: input.url, attachment: input.file.name, pageCount: 3, majors: ['ALTO', 'TENOR'] };
    },
  } as unknown as JobSourceSupport;
  const crawler = new BoryeongChoirJobCrawler({} as BoryeongNoticeClient, support, gateway);
  return { crawler, calls };
}

const NOTICE_URL = 'https://www.brcn.go.kr/cop/bbs/BBSMSTR_000000000983/selectBoardArticle.do?bbsId=BBSMSTR_000000000983&nttId=199082';
const NOTICE_FILE = '2026년 보령시립합창단 하반기 신규단원 모집 공고(안).hwpx';
const TITLE = '2026년 보령시립합창단 하반기 신규단원 모집';

describe('BoryeongChoirJobCrawler', () => {
  it('그날 채용 공고 1건을 내려받아 등록을 요청한다', async () => {
    const { crawler, calls } = build();
    const summary = await crawler.crawl('2026-10-27');

    expect(summary).toMatchObject({ source: 'boryeong', sourceName: '보령시립합창단', date: '2026-10-27', scanned: 1, matched: 1, skipped: [], failed: [] });
    expect(summary.created).toEqual([{ jobId: 999, title: TITLE, url: NOTICE_URL, attachment: NOTICE_FILE, pageCount: 3, majors: ['ALTO', 'TENOR'] }]);
    expect(calls.list).toEqual([1]);
    expect(calls.detail).toEqual(['199082']);
    expect(calls.download).toEqual([NOTICE_FILE]);
    expect(calls.logo).toEqual(['boryeong:assets/job-crawler/boryeong.png']);

    const reg = calls.registrations[0];
    expect(reg).toMatchObject({
      source: 'boryeong',
      title: TITLE,
      url: NOTICE_URL,
      companyName: '보령시립합창단',
      address: '충남 보령시 성주산로 101',
      addressDetail: '보령문화예술회관',
      imageUrl: LOGO,
      date: '2026-10-27',
    });
    expect(reg.file.name).toBe(NOTICE_FILE);
    expect(reg.file.buffer.toString()).toBe('hwpx');
    expect(reg.bodyText.startsWith('음악을 사랑하고 지역문화 발전에 기여할')).toBe(true);
    expect(reg.bodyText).toContain('1. 모집인원: 21명');
  });

  it('같은 URL 이 이미 등록돼 있으면 건너뛴다', async () => {
    const { crawler, calls } = build({ existing: 5 });
    const summary = await crawler.crawl('2026-10-27');
    expect(summary.created).toEqual([]);
    expect(summary.skipped).toEqual([{ title: TITLE, url: NOTICE_URL, reason: '이미 등록됨 (job 5)' }]);
    expect(calls.download).toEqual([]);
    expect(calls.registrations).toEqual([]);
  });

  it('다른 날짜면 아무것도 하지 않는다', async () => {
    const { crawler, calls } = build();
    const summary = await crawler.crawl('2026-10-28');
    expect(summary.scanned).toBe(0);
    expect(summary.matched).toBe(0);
    expect(calls.list).toEqual([1]);
    expect(calls.registrations).toEqual([]);
  });

  it('다운로드 실패는 failed 에 담긴다', async () => {
    const { crawler, calls } = build({ downloadError: '첨부파일 다운로드 실패' });
    const summary = await crawler.crawl('2026-10-27');
    expect(summary.failed).toEqual([{ title: TITLE, url: NOTICE_URL, reason: '첨부파일 다운로드 실패' }]);
    expect(calls.registrations).toEqual([]);
  });

  it('소년소녀합창단 정기연주회 · 최종합격자 알림은 같은 날이어도 대상이 아니다', async () => {
    const sameDay = page1.replace(/2025-11-14|2023-04-28/g, '2026-10-27');
    const { crawler, calls } = build({ pages: { 1: sameDay, 2: page2 } });
    const summary = await crawler.crawl('2026-10-27');
    expect(summary.scanned).toBe(3);
    expect(summary.matched).toBe(1);
    expect(calls.detail).toEqual(['199082']);
  });

  it('1페이지 일반 행이 모두 그날이면 2페이지를 읽고, 일반 행이 없으면 멈춘다 — 고정 공지는 한 번만 센다', async () => {
    const allToday = page1.replace(/<td class="date">\d{4}-\d{2}-\d{2}<\/td>/g, '<td class="date">2026-10-27</td>');
    const { crawler, calls } = build({ pages: { 1: allToday, 2: page2 } });
    const summary = await crawler.crawl('2026-10-27');
    expect(calls.list).toEqual([1, 2]);
    expect(summary.scanned).toBe(10);
    // 모집 3건(2026 하반기 · 2024 · 2023) 만 대상
    expect(summary.matched).toBe(3);
    expect(calls.detail).toEqual(['199082', '181817', '173833']);
  });
});
