import * as fs from 'fs';
import * as path from 'path';
import { CompetitionRepository } from '../competition.repository';
import { ContestCompetitionCrawler } from './contest-competition.crawler';
import { ContestNoticeClient, ContestNoticeGateway } from './contest-notice.client';

/**
 * 스펙 (사이트는 가짜 게이트웨이 — 목록은 실제 픽스처, 상세는 모두 23151 픽스처 — 저장소는 가짜)
 * 1) 목록 50행 중 콩쿠르로 판정된 행만 상세를 읽어 upsertCrawled 로 저장한다 (원문 URL 이 키). 생성/갱신을 나눠 센다
 * 2) 저장 입력: 제목·주최(목록)·지역·장소·주관(주최와 다를 때만)·부문(제목 추출)·대상·접수 시작/마감·대회일·전화·이메일·포스터·접수 방법 LINK(원문 URL)
 * 3) 상세를 못 읽은 행은 failed 로 모이고 나머지는 계속된다
 * 4) 중복: 원문 URL 이 삭제된 공고면 건너뜀, 직접 등록본에 붙은 URL 이면 merged. URL 이 새로워도 제목·주최 키+마감 ±3일이 같은
 *    직접 등록본이 있으면 거기에 원문·포스터를 붙이고(merged) 새로 만들지 않는다. 같은 키의 다른 수집본이 있으면 skipped
 */
const fixture = (name: string) => fs.readFileSync(path.join(__dirname, '__fixtures__', name), 'utf8');

function build(
  opts: {
    failId?: string;
    known?: Record<string, { id: number; source: 'OWNER' | 'CRAWL'; deleted: boolean }>;
    duplicateOf?: { id: number; source: 'OWNER' | 'CRAWL'; status: string; source_url: string | null; poster_url: string | null };
  } = {},
) {
  const calls = { detail: [] as string[], upserts: [] as { input: any; url: string }[], attached: [] as { id: number; url: string }[] };
  const gateway: ContestNoticeGateway = {
    fetchList: async () => fixture('list-2026-11-11.html'),
    fetchDetail: async id => {
      calls.detail.push(id);
      if (id === opts.failId) throw new Error('timeout');
      return fixture('detail-23151.html');
    },
  };
  let seq = 100;
  const repository = {
    findBySourceUrl: jest.fn(async (url: string) => opts.known?.[url] ?? null),
    findDuplicates: jest.fn(async () => (opts.duplicateOf ? [opts.duplicateOf] : [])),
    attachSource: jest.fn(async (id: number, url: string) => {
      calls.attached.push({ id, url });
    }),
    upsertCrawled: jest.fn(async (input: any, url: string) => {
      calls.upserts.push({ input, url });
      const created = url.endsWith('/22917') === false;
      return { id: seq++, created };
    }),
  } as unknown as CompetitionRepository;
  return { crawler: new ContestCompetitionCrawler({} as ContestNoticeClient, repository, gateway), calls };
}

describe('ContestCompetitionCrawler', () => {
  it('콩쿠르만 골라 상세를 읽고 저장한다', async () => {
    const { crawler, calls } = build();
    const summary = await crawler.crawl();
    expect(summary.scanned).toBe(50);
    expect(summary.matched).toBeGreaterThanOrEqual(30);
    expect(summary.matched).toBeLessThan(50);
    expect(calls.detail).toHaveLength(summary.matched);
    expect(summary.created.length + summary.updated.length).toBe(summary.matched);
    expect(summary.updated.map(u => u.url)).toEqual(['https://contest.co.kr/contest/view1/22917']);
    expect(summary.failed).toEqual([]);
    expect(calls.detail).not.toContain('23165'); // 입시평가회
    expect(calls.detail).not.toContain('22498'); // 마스터 클래스
    expect(calls.detail).toContain('23142'); // 전국성악콩쿨
  });

  it('저장 입력 — 목록 행 + 상세 필드 조합', async () => {
    const { crawler, calls } = build();
    await crawler.crawl();
    const first = calls.upserts.find(u => u.url.endsWith('/22917'))!;
    expect(first.input).toMatchObject({
      title: '제13회 수원시전국음악콩쿠르', // 상세(픽스처) 제목이 우선
      host: '재단법인) 세종국제예술문화재단',
      organizer: '(사)한국음악협회 수원시지부',
      area: '경기',
      venue: '수원문화원 빛누리아트홀',
      divisions: ['종합'],
      ages: [],
      openAt: '2026-11-01',
      closeAt: '2026-11-25',
      heldAt: '2026-11-28',
      applyMethod: 'LINK',
      applyLink: 'https://contest.co.kr/contest/view1/22917',
      tel: '010-5261-8125',
      email: 'nartec@naver.com',
      posterUrl: 'https://contest.co.kr/data/media/image/contest/202611/imgm_20261107122317400.jpg',
      description: '본 대회는 주최측 홈페이지에서 접수가 가능합니다.',
    });
    const vocal = calls.upserts.find(u => u.url.endsWith('/23142'))!;
    expect(vocal.input.divisions).toEqual(['성악']);
  });

  it('상세 실패는 failed 로 모이고 나머지는 계속된다', async () => {
    const { crawler } = build({ failId: '23142' });
    const summary = await crawler.crawl();
    expect(summary.failed).toEqual([{ title: '2026 한국가창지도지협회 전국성악콩쿨', url: 'https://contest.co.kr/contest/view1/23142', reason: 'timeout' }]);
    expect(summary.created.length + summary.updated.length).toBe(summary.matched - 1);
  });

  it('중복 — 삭제된 원문은 건너뛰고, 직접 등록본에 붙은 원문은 merged', async () => {
    const url = (id: string) => `https://contest.co.kr/contest/view1/${id}`;
    const { crawler, calls } = build({
      known: { [url('22917')]: { id: 1, source: 'CRAWL', deleted: true }, [url('23063')]: { id: 2, source: 'OWNER', deleted: false } },
    });
    const summary = await crawler.crawl();
    expect(summary.skipped).toContainEqual({ title: '제30회 세종오케스트라국제음악콩쿠르', url: url('22917'), reason: '관리자가 삭제한 공고 (id 1)' });
    expect(summary.merged).toContainEqual({ id: 2, title: '2026 한국 베토벤 음악 콩쿠르', url: url('23063') });
    expect(calls.upserts.map(u => u.url)).not.toContain(url('22917'));
    expect(calls.upserts.map(u => u.url)).not.toContain(url('23063'));
  });

  it('중복 — 키가 같은 직접 등록본이 있으면 원문·포스터를 붙이고 새로 만들지 않는다', async () => {
    const { crawler, calls } = build({ duplicateOf: { id: 7, source: 'OWNER', status: 'PUBLISHED', source_url: null, poster_url: null } });
    const summary = await crawler.crawl();
    expect(summary.created).toEqual([]);
    expect(summary.updated).toEqual([]);
    expect(summary.merged).toHaveLength(summary.matched);
    expect(calls.attached[0]).toEqual({ id: 7, url: 'https://contest.co.kr/contest/view1/22917' });
    expect(calls.upserts).toEqual([]);
  });

  it('중복 — 키가 같은 다른 수집본이 있으면 건너뛴다', async () => {
    const { crawler, calls } = build({ duplicateOf: { id: 9, source: 'CRAWL', status: 'PUBLISHED', source_url: 'https://other/1', poster_url: null } });
    const summary = await crawler.crawl();
    expect(summary.skipped[0]).toMatchObject({ reason: '같은 대회가 이미 있음 (id 9, https://other/1)' });
    expect(calls.upserts).toEqual([]);
  });

  it('limit — 목록 앞에서 그 개수만 본다 (스케줄은 limit 없이 전체)', async () => {
    const { crawler, calls } = build();
    const summary = await crawler.crawl({ limit: 5 });
    expect(summary.scanned).toBe(5);
    expect(summary.matched).toBeLessThanOrEqual(5);
    expect(calls.detail.length).toBe(summary.matched);
    expect(calls.detail[0]).toBe('22917');
  });
});
