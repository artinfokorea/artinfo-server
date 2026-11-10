import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CompetitionController } from './competition.controller';
import { CompetitionService } from './competition.service';
import { ContestCompetitionCrawler } from './crawler/contest-competition.crawler';
import { CompetitionWriteRequest, GetCompetitionsRequest } from './dto/competition.request';
import { CompetitionRow } from './competition.types';

/**
 * 기대값
 * 1) GET /competitions: 쿼리의 phases/divisions/areas 는 값 하나도 배열로 받고, 응답은 { competitions: [...], totalCount }
 *    각 항목은 camelCase 이며 날짜는 YYYY-MM-DD, authorId = user_id, phase·dDay·openIn 이 들어간다
 * 2) GET /competitions/:id: 토큰이 있으면 그 회원 ID 로, 없으면 null 로 서비스에 넘긴다
 * 3) POST: 요청 DTO 검증 — 제목·주최·지역·부문(1개 이상)·접수 시작/마감(YYYY-MM-DD)·접수 방법은 필수, 빈 문자열은 null 로
 *    응답 { id, status }
 * 4) PUT/DELETE/publish 는 회원 ID 와 id 를 서비스로 넘기고 OkResponse
 */
describe('CompetitionController', () => {
  const service = { findPage: jest.fn(), findOne: jest.fn(), create: jest.fn(), update: jest.fn(), remove: jest.fn(), publish: jest.fn(), isAdmin: jest.fn() };
  const crawler = { crawl: jest.fn() };
  const controller = new CompetitionController(service as unknown as CompetitionService, crawler as unknown as ContestCompetitionCrawler);
  const me = { id: 7, name: '나', email: 'me@example.com' };
  const row: CompetitionRow = {
    id: 1,
    title: '제13회 수원시전국음악콩쿠르',
    host: '(사)한국음악협회 수원시지부',
    organizer: null,
    area: '경기',
    venue: '수원문화원',
    divisions: ['피아노', '성악'],
    ages: ['초등'],
    open_at: new Date('2026-11-01T00:00:00Z'),
    close_at: '2026-11-25',
    held_at: '2026-11-28',
    result_at: null,
    fee: '60,000원',
    apply_method: 'LINK',
    apply_link: 'https://contest.co.kr/contest/view1/23151',
    tel: null,
    email: null,
    prize: null,
    description: null,
    poster_url: null,
    document_url: null,
    source: 'CRAWL',
    source_url: 'https://contest.co.kr/contest/view1/23151',
    status: 'PUBLISHED',
    user_id: 3,
    verified: false,
    view_count: 12,
    created_at: new Date('2026-11-02T03:00:00Z'),
    updated_at: new Date('2026-11-02T03:00:00Z'),
    phase: 'OPEN',
    d_day: 14,
    open_in: -10,
  };

  beforeEach(() => jest.clearAllMocks());

  it('list — 쿼리를 필터로 바꾸고 camelCase 응답', async () => {
    service.findPage.mockResolvedValue({ items: [row], totalCount: 1 });
    const request = plainToInstance(GetCompetitionsRequest, { page: '1', size: '20', phases: 'OPEN', divisions: ['피아노'], keyword: '수원' });
    expect(await validate(request)).toHaveLength(0);
    const response = await controller.list(request);
    expect(service.findPage).toHaveBeenCalledWith({ page: 1, size: 20, keyword: '수원', phases: ['OPEN'], divisions: ['피아노'], areas: [] });
    expect(response.totalCount).toBe(1);
    expect(response.competitions[0]).toMatchObject({
      id: 1,
      title: '제13회 수원시전국음악콩쿠르',
      area: '경기',
      divisions: ['피아노', '성악'],
      openAt: '2026-11-01',
      closeAt: '2026-11-25',
      heldAt: '2026-11-28',
      resultAt: null,
      applyMethod: 'LINK',
      source: 'CRAWL',
      authorId: 3,
      phase: 'OPEN',
      dDay: 14,
      openIn: -10,
      viewCount: 12,
      createdAt: '2026-11-02T03:00:00.000Z',
    });
  });

  it('list — 잘못된 phase 는 거부', async () => {
    const request = plainToInstance(GetCompetitionsRequest, { page: 1, size: 10, phases: ['SOMETHING'] });
    expect((await validate(request)).map(e => e.property)).toEqual(['phases']);
  });

  it('detail — 토큰 회원 ID 또는 null', async () => {
    service.findOne.mockResolvedValue(row);
    await controller.detail(1, { user: me } as never);
    expect(service.findOne).toHaveBeenLastCalledWith(1, 7);
    await controller.detail(1, {} as never);
    expect(service.findOne).toHaveBeenLastCalledWith(1, null);
  });

  it('create — DTO 검증과 null 정리, 응답 { id, status }', async () => {
    const bad = plainToInstance(CompetitionWriteRequest, {
      title: ' ',
      host: 'H',
      area: '서울',
      divisions: [],
      openAt: '2026-1-1',
      closeAt: '2026-12-01',
      applyMethod: 'FAX',
    });
    expect((await validate(bad)).map(e => e.property).sort()).toEqual(['applyMethod', 'divisions', 'openAt', 'title']);

    const good = plainToInstance(CompetitionWriteRequest, {
      title: ' 제5회 아트인포 콩쿠르 ',
      host: '아트인포',
      area: '경기',
      venue: '',
      divisions: '피아노',
      ages: ['중등', ''],
      openAt: '2026-11-20',
      closeAt: '2026-12-19',
      heldAt: '',
      applyMethod: 'LINK',
      applyLink: 'https://forms.gle/x',
      fee: '',
      prize: '대상 300만원',
    });
    expect(await validate(good)).toHaveLength(0);
    service.create.mockResolvedValue({ id: 10, status: 'REVIEW' });
    await expect(controller.create(me, good)).resolves.toEqual({ id: 10, status: 'REVIEW' });
    expect(service.create).toHaveBeenCalledWith(
      7,
      expect.objectContaining({
        title: '제5회 아트인포 콩쿠르',
        host: '아트인포',
        venue: null,
        divisions: ['피아노'],
        ages: ['중등'],
        heldAt: null,
        resultAt: null,
        fee: null,
        applyLink: 'https://forms.gle/x',
        prize: '대상 300만원',
        posterUrl: null,
      }),
    );
  });

  it('update / remove / publish', async () => {
    const good = plainToInstance(CompetitionWriteRequest, {
      title: 'T',
      host: 'H',
      area: '서울',
      divisions: ['성악'],
      openAt: '2026-11-20',
      closeAt: '2026-12-19',
      applyMethod: 'EMAIL',
      email: 'a@b.c',
    });
    await expect(controller.update(me, 5, good)).resolves.toMatchObject({ code: 'OK' });
    expect(service.update).toHaveBeenCalledWith(5, 7, expect.objectContaining({ title: 'T', applyMethod: 'EMAIL', email: 'a@b.c' }));
    await expect(controller.remove(me, 5)).resolves.toMatchObject({ code: 'OK' });
    expect(service.remove).toHaveBeenCalledWith(5, 7);
    await expect(controller.publish(me, 5)).resolves.toMatchObject({ code: 'OK' });
    expect(service.publish).toHaveBeenCalledWith(5, 7);
  });

  it('crawl — 관리자만 수집을 돌리고 요약을 돌려준다', async () => {
    service.isAdmin.mockResolvedValueOnce(false);
    await expect(controller.crawl(me)).rejects.toMatchObject({ status: 403 });
    service.isAdmin.mockResolvedValueOnce(true);
    crawler.crawl.mockResolvedValueOnce({
      source: 'contest',
      scanned: 50,
      matched: 30,
      created: [{ id: 1, title: 't', url: 'u' }],
      updated: [],
      merged: [],
      skipped: [],
      failed: [],
      elapsedMs: 10,
    });
    await expect(controller.crawl(me)).resolves.toMatchObject({
      source: 'contest',
      scanned: 50,
      matched: 30,
      createdCount: 1,
      updatedCount: 0,
      mergedCount: 0,
    });
  });
});
