import { DataSource } from 'typeorm';
import { CompetitionRepository } from './competition.repository';

/**
 * 기대값 (DataSource.query 를 가짜로 두고 SQL·파라미터만 본다)
 * 1) ensureSchema: competitions 테이블·source_url 부분 유니크 인덱스를 IF NOT EXISTS 로 만든다
 * 2) findPage: 게시된(PUBLISHED)·삭제 안 된 공고만, phases 가 비면 CLOSED 제외, OPEN 을 고르면 SOON 도 포함,
 *    부문은 배열 겹침(&&), 지역은 ANY, 키워드는 ILIKE, 정렬은 phase 순서 → 가까운 날짜, LIMIT/OFFSET 은 page·size 로
 * 3) findById: 삭제 안 된 행 하나 (status 는 가리지 않음), 없으면 null
 * 4) create: 24개 컬럼 INSERT … RETURNING id, 상태·출처·회원은 meta 로
 * 5) softDelete 는 deleted_at 만 찍고, isAdmin 은 users.type = 'ADMIN' 으로 판단
 * 6) upsertCrawled: source_url 충돌이면 일정·장소·포스터만 갱신(삭제된 공고는 제외), RETURNING 의 xmax=0 으로 생성 여부
 */
describe('CompetitionRepository', () => {
  const query = jest.fn();
  const repository = new CompetitionRepository({ query } as unknown as DataSource);
  const lastCall = () => query.mock.calls[query.mock.calls.length - 1] as [string, unknown[]];
  const row = (over: Record<string, unknown> = {}) => ({ id: 1, title: 't', phase: 'OPEN', d_day: 3, open_in: -5, total_count: 7, ...over });

  beforeEach(() => jest.clearAllMocks());

  it('ensureSchema — 멱등 DDL', async () => {
    query.mockResolvedValue([]);
    await repository.ensureSchema();
    const sqls = query.mock.calls.map(c => c[0] as string);
    expect(sqls[0]).toContain('CREATE TABLE IF NOT EXISTS competitions');
    expect(sqls[0]).toContain("status        VARCHAR(16) NOT NULL DEFAULT 'REVIEW'");
    expect(sqls.some(s => s.includes('CREATE UNIQUE INDEX IF NOT EXISTS uidx_competitions_source_url') && s.includes('WHERE source_url IS NOT NULL'))).toBe(
      true,
    );
  });

  it('findPage — 기본은 게시된 공고 중 종료 제외, 마감임박순, 페이지 계산', async () => {
    query.mockResolvedValueOnce([row(), row({ id: 2 })]);
    const result = await repository.findPage({ page: 2, size: 10, keyword: null, phases: [], divisions: [], areas: [] });
    expect(result.totalCount).toBe(7);
    expect(result.items).toHaveLength(2);
    const [sql, params] = lastCall();
    expect(sql).toContain("(now() AT TIME ZONE 'Asia/Seoul')::date AS today");
    expect(sql).toContain("c.deleted_at IS NULL AND c.status = 'PUBLISHED'");
    expect(sql).toContain("WHERE phase <> 'CLOSED'");
    expect(sql).toContain("ORDER BY CASE phase WHEN 'SOON' THEN 0 WHEN 'OPEN' THEN 1 WHEN 'UPCOMING' THEN 2 WHEN 'JUDGING' THEN 3 ELSE 4 END");
    expect(sql).toContain('LIMIT $1 OFFSET $2');
    expect(params).toEqual([10, 10]);
  });

  it('findPage — 상태·부문·지역·키워드 필터 (OPEN 은 SOON 포함)', async () => {
    query.mockResolvedValueOnce([]);
    const result = await repository.findPage({
      page: 1,
      size: 20,
      keyword: ' 수원 ',
      phases: ['OPEN', 'UPCOMING'],
      divisions: ['피아노'],
      areas: ['경기', '서울'],
    });
    expect(result).toEqual({ items: [], totalCount: 0 });
    const [sql, params] = lastCall();
    expect(sql).toContain('phase = ANY($1::text[])');
    expect(sql).toContain('divisions && $2::text[]');
    expect(sql).toContain('area = ANY($3::text[])');
    expect(sql).toContain('(title ILIKE $4 OR host ILIKE $4 OR area ILIKE $4)');
    expect(sql).toContain('LIMIT $5 OFFSET $6');
    expect(params).toEqual([['OPEN', 'UPCOMING', 'SOON'], ['피아노'], ['경기', '서울'], '%수원%', 20, 0]);
  });

  it('findById — 삭제 안 된 행 하나, 없으면 null', async () => {
    query.mockResolvedValueOnce([row({ status: 'REVIEW' })]);
    await expect(repository.findById(1)).resolves.toMatchObject({ id: 1, status: 'REVIEW' });
    const [sql, params] = lastCall();
    expect(sql).toContain('WHERE c.id = $1 AND c.deleted_at IS NULL');
    expect(sql).not.toContain("status = 'PUBLISHED'");
    expect(params).toEqual([1]);
    query.mockResolvedValueOnce([]);
    await expect(repository.findById(99)).resolves.toBeNull();
  });

  it('create — INSERT … RETURNING id, 상태·출처·회원은 meta 로', async () => {
    query.mockResolvedValueOnce([{ id: 42 }]);
    const input = {
      title: 'T',
      host: 'H',
      organizer: null,
      area: '서울',
      venue: null,
      divisions: ['성악'],
      ages: [],
      openAt: '2026-11-20',
      closeAt: '2026-12-19',
      heldAt: '2027-01-16',
      resultAt: null,
      fee: null,
      applyMethod: 'LINK' as const,
      applyLink: 'https://x',
      tel: null,
      email: null,
      prize: null,
      description: null,
      posterUrl: null,
      documentUrl: null,
      contentImages: ['https://img/1.jpg'],
    };
    await expect(repository.create(input, { userId: 7, status: 'REVIEW', source: 'OWNER' })).resolves.toBe(42);
    const [sql, params] = lastCall();
    expect(sql).toContain('INSERT INTO competitions');
    expect(sql).toContain('RETURNING id');
    expect(params).toHaveLength(26);
    expect(params[20]).toEqual(['https://img/1.jpg']);
    expect(params.slice(21)).toEqual(['OWNER', null, 'REVIEW', 7, 't|h']);
    expect(params[0]).toBe('T');
    expect(params[5]).toEqual(['성악']);
  });

  it('softDelete 는 deleted_at 만, isAdmin 은 users.type 으로', async () => {
    query.mockResolvedValueOnce([]);
    await repository.softDelete(3);
    expect(lastCall()[0]).toContain('UPDATE competitions SET deleted_at = now() WHERE id = $1 AND deleted_at IS NULL');
    query.mockResolvedValueOnce([{ type: 'ADMIN' }]);
    await expect(repository.isAdmin(1)).resolves.toBe(true);
    expect(lastCall()[0]).toContain('SELECT type FROM users WHERE id = $1');
    query.mockResolvedValueOnce([{ type: 'CLIENT' }]);
    await expect(repository.isAdmin(2)).resolves.toBe(false);
    query.mockResolvedValueOnce([]);
    await expect(repository.isAdmin(3)).resolves.toBe(false);
  });

  it('upsertCrawled — source_url 로 upsert, 삭제된 공고는 되살리지 않는다', async () => {
    const input = {
      title: 'T',
      host: 'H',
      organizer: null,
      area: '서울',
      venue: null,
      divisions: ['종합'],
      ages: [],
      openAt: '2026-11-01',
      closeAt: '2026-11-25',
      heldAt: null,
      resultAt: null,
      fee: null,
      applyMethod: 'LINK' as const,
      applyLink: 'https://contest.co.kr/contest/view1/1',
      tel: null,
      email: null,
      prize: null,
      description: null,
      posterUrl: null,
      documentUrl: null,
      contentImages: [],
    };
    query.mockResolvedValueOnce([{ id: 5, created: true }]);
    await expect(repository.upsertCrawled(input, 'https://contest.co.kr/contest/view1/1', 4637)).resolves.toEqual({ id: 5, created: true });
    const [sql, params] = lastCall();
    expect(sql).toContain("'CRAWL', $22, 'PUBLISHED', $23, $24");
    expect(sql).toContain('user_id = COALESCE(competitions.user_id, EXCLUDED.user_id)');
    expect(sql).toContain('ON CONFLICT (source_url) WHERE source_url IS NOT NULL DO UPDATE SET');
    expect(sql).toContain('WHERE competitions.deleted_at IS NULL');
    expect(sql).toContain('RETURNING id, (xmax = 0) AS created');
    expect(params).toHaveLength(24);
    expect(params[20]).toEqual([]);
    expect(params[22]).toBe(4637);
    expect(params[23]).toBe('t|h');
    expect(sql).toContain("WHERE competitions.deleted_at IS NULL AND competitions.source = 'CRAWL'");
    expect(params[21]).toBe('https://contest.co.kr/contest/view1/1');

    query.mockResolvedValueOnce([]).mockResolvedValueOnce([{ id: 9 }]);
    await expect(repository.upsertCrawled(input, 'https://contest.co.kr/contest/view1/1', 4637)).resolves.toEqual({ id: 9, created: false });
  });

  it('findBySourceUrl / findDuplicates / attachSource', async () => {
    query.mockResolvedValueOnce([{ id: 3, source: 'CRAWL', deleted: true }]);
    await expect(repository.findBySourceUrl('https://x/1')).resolves.toEqual({ id: 3, source: 'CRAWL', deleted: true });
    expect(lastCall()[0]).toContain('(deleted_at IS NOT NULL) AS deleted FROM competitions WHERE source_url = $1');

    query.mockResolvedValueOnce([]);
    await repository.findDuplicates('k|h', '2026-11-25', 9);
    const [sql, params] = lastCall();
    expect(sql).toContain('WHERE dedupe_key = $1 AND deleted_at IS NULL AND ABS(close_at - $2::date) <= $3');
    expect(sql).toContain("ORDER BY CASE source WHEN 'OWNER' THEN 0 ELSE 1 END");
    expect(params).toEqual(['k|h', '2026-11-25', 3, 9]);

    query.mockResolvedValueOnce([]);
    await repository.attachSource(9, 'https://x/1', null);
    expect(lastCall()[0]).toContain('SET source_url = COALESCE(source_url, $2), poster_url = COALESCE(poster_url, $3)');
    expect(lastCall()[1]).toEqual([9, 'https://x/1', null]);
  });

  it('findUserIdByEmail — 탈퇴하지 않은 회원의 id, 없으면 null', async () => {
    query.mockResolvedValueOnce([{ id: 4637 }]);
    await expect(repository.findUserIdByEmail('artinfokorea2022@gmail.com')).resolves.toBe(4637);
    expect(lastCall()[0]).toContain('SELECT id FROM users WHERE email = $1 AND deleted_at IS NULL');
    query.mockResolvedValueOnce([]);
    await expect(repository.findUserIdByEmail('x@y.z')).resolves.toBeNull();
  });
});
