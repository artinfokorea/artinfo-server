import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DataSource } from 'typeorm';
import { AdminStatsRepository } from '@/admin/repository/admin-stats.repository';
import { ArtinfoActivityRepository } from '@/activity/repository/artinfo-activity.repository';
import { OngiSchemaBootstrapService } from '@/ongi/common/ongi-schema-bootstrap.service';

/** 관리자(users.type = ADMIN) 가 어느 지표에도 들어가지 않는지 SQL 문자열로 확인한다 (DB 없이 CI 에서 돈다) */
describe('AdminStatsRepository — 관리자 제외 조건이 SQL 에 들어간다', () => {
  const query = jest.fn().mockResolvedValue([{ total: 0 }]);
  const repository = new AdminStatsRepository({ query } as unknown as DataSource);
  const lastSql = () => String(query.mock.calls[query.mock.calls.length - 1][0]);
  const allSql = () => query.mock.calls.map(c => String(c[0])).join('\n');

  beforeEach(() => query.mockClear());

  it('overview — 회원 수와 로그인 사용자 수에서 관리자를 뺀다', async () => {
    await repository.overview();
    const sql = lastSql();
    expect(sql).toContain(`FROM users WHERE deleted_at IS NULL AND type <> 'ADMIN'`);
    expect(sql).toContain(`FROM auths WHERE user_id NOT IN (SELECT id FROM users WHERE type = 'ADMIN')`);
  });

  it('daily — 가입·로그인 사용자에서 관리자를 뺀다', async () => {
    await repository.daily(7);
    const sql = lastSql();
    expect(sql).toContain(`FROM users WHERE type <> 'ADMIN'`);
    expect(sql).toContain(`FROM auths WHERE user_id NOT IN (SELECT id FROM users WHERE type = 'ADMIN')`);
  });

  it('loginsByType · recentUsers — 관리자를 뺀다', async () => {
    await repository.loginsByType();
    expect(lastSql()).toContain(`user_id NOT IN (SELECT id FROM users WHERE type = 'ADMIN')`);
    await repository.recentUsers(10);
    expect(lastSql()).toContain(`type <> 'ADMIN'`);
  });

  it('방문자 활동(요약·일별·리텐션·목록) — 관리자로 로그인한 적 있는 방문자를 뺀다', async () => {
    const adminVisitor = `visitor_id NOT IN (SELECT visitor_id FROM artinfo_visitor_daily_activity WHERE user_id IN (SELECT id FROM users WHERE type = 'ADMIN'))`;
    await repository.engagementSummary();
    expect(lastSql()).toContain(adminVisitor);
    await repository.engagementDaily(7);
    expect(lastSql()).toContain(adminVisitor);
    query.mockClear();
    await repository.retention('2026-09-07');
    expect(allSql().split(adminVisitor).length - 1).toBeGreaterThanOrEqual(2);
    query.mockClear();
    await repository.visitors('2026-11-03', 50, 0);
    expect(allSql().split(adminVisitor).length - 1).toBe(2);
  });

  it('visitors — 마지막으로 본 페이지(exit_path) 를 내려준다', async () => {
    await repository.visitors('2026-11-03', 50, 0);
    expect(lastSql()).toContain(`a.exit_path AS "exitPath"`);
  });
});

/**
 * 실제 PostgreSQL 로 지표 값을 확인한다. ARTINFO_TEST_DB_URL 을 줄 때만 돈다 (CI 에서는 건너뜀).
 *   docker run -d --name artinfo-stats-pg -e POSTGRES_PASSWORD=test -p 55440:5432 postgres:16-alpine
 *   ARTINFO_TEST_DB_URL=postgres://postgres:test@localhost:55440/postgres npx jest admin-stats.repository
 * 주의: 테스트용 빈 DB 에만 쓸 것 — public 스키마를 지우고 다시 만든다.
 */
const DB_URL = process.env.ARTINFO_TEST_DB_URL;
const run = DB_URL ? describe : describe.skip;

run('AdminStatsRepository — 실제 DB 에서 관리자 제외', () => {
  let dataSource: DataSource;
  let repository: AdminStatsRepository;
  let activity: ArtinfoActivityRepository;

  const day = async (daysAgo: number): Promise<string> => {
    const [row] = await dataSource.query(`SELECT to_char((now() AT TIME ZONE 'Asia/Seoul')::date - $1::int, 'YYYY-MM-DD') AS "day"`, [daysAgo]);
    return row.day;
  };

  beforeAll(async () => {
    dataSource = new DataSource({ type: 'postgres', url: DB_URL, extra: { options: `-c timezone=UTC` } });
    await dataSource.initialize();
    await dataSource.query(`DROP SCHEMA public CASCADE; CREATE SCHEMA public;`);
    await dataSource.query(readFileSync(join(__dirname, '../../activity/artinfo-visitor-daily-activity.ddl.sql'), 'utf8'));
    // 기동 시 부트스트랩이 같은 컬럼을 만들어 주는지도 함께 확인한다 (DDL 파일과 어긋나면 여기서 드러난다)
    await new OngiSchemaBootstrapService(dataSource).onModuleInit();
    await dataSource.query(`
      CREATE TABLE users (id INT PRIMARY KEY, type VARCHAR(20) NOT NULL DEFAULT 'CLIENT', name VARCHAR(50), nickname VARCHAR(50), email VARCHAR(100),
                          created_at TIMESTAMP NOT NULL DEFAULT now(), deleted_at TIMESTAMP);
      CREATE TABLE auths (id SERIAL PRIMARY KEY, type VARCHAR(20) NOT NULL, user_id INT NOT NULL, created_at TIMESTAMP NOT NULL DEFAULT now());
      -- overview · daily 가 함께 세는 테이블들 — 이 테스트에서는 비어 있다
      CREATE TABLE jobs (id SERIAL PRIMARY KEY, type VARCHAR(20), is_active BOOLEAN DEFAULT true, created_at TIMESTAMP NOT NULL DEFAULT now());
      CREATE TABLE lessons (id SERIAL PRIMARY KEY);
      CREATE TABLE performances (id SERIAL PRIMARY KEY, end_at TIMESTAMP);
      CREATE TABLE posts (id SERIAL PRIMARY KEY, title VARCHAR(200), view_count INT DEFAULT 0, created_at TIMESTAMP NOT NULL DEFAULT now(), deleted_at TIMESTAMP);
      CREATE TABLE comments (id SERIAL PRIMARY KEY, created_at TIMESTAMP NOT NULL DEFAULT now());
      CREATE TABLE news (id SERIAL PRIMARY KEY);
      CREATE TABLE inquiries (id SERIAL PRIMARY KEY, title VARCHAR(200), email VARCHAR(100), created_at TIMESTAMP NOT NULL DEFAULT now());
    `);
    repository = new AdminStatsRepository(dataSource);
    activity = new ArtinfoActivityRepository(dataSource);

    const ago = (days: number) => `now() - interval '${days} days'`;
    await dataSource.query(`
      INSERT INTO users (id, type, name, nickname, email, created_at, deleted_at) VALUES
        (1, 'CLIENT', '회원A', '회원A', 'a@test.com', ${ago(40)}, NULL),
        (2, 'CLIENT', '회원B', '회원B', 'b@test.com', ${ago(2)}, NULL),
        (3, 'ADMIN',  '관리자', '관리자', 'admin@test.com', ${ago(1)}, NULL),
        (4, 'CLIENT', '탈퇴', '탈퇴', 'd@test.com', ${ago(3)}, now());
      INSERT INTO auths (type, user_id, created_at) VALUES
        ('KAKAO', 1, ${ago(2)}),
        ('GOOGLE', 2, ${ago(10)}),
        ('EMAIL', 3, ${ago(1)}),
        ('EMAIL', 3, now());
    `);

    const base = { seconds: 0, pageViews: 0, newSession: false, userAgent: 'Mozilla/5.0 (iPhone)', referrerHost: null, landingPath: '/', exitPath: '/' };
    // 회원A — 오늘 / 로 들어와 /jobs/1 에서 나감
    await activity.addPing({ ...base, visitorId: 'v1', userId: 1, seconds: 100, pageViews: 1, newSession: true });
    await activity.addPing({ ...base, visitorId: 'v1', userId: 1, seconds: 20, pageViews: 2, exitPath: '/jobs/1' });
    // 비회원 — 오늘 60초
    await activity.addPing({
      ...base,
      visitorId: 'v2',
      userId: null,
      seconds: 60,
      pageViews: 1,
      newSession: true,
      landingPath: '/lessons',
      exitPath: '/lessons',
    });
    // 관리자 — 오늘 로그인 상태로 오래 머묾 (어느 수치에도 들어가면 안 된다)
    await activity.addPing({ ...base, visitorId: 'v3', userId: 3, seconds: 300, pageViews: 10, newSession: true, landingPath: '/admin', exitPath: '/admin' });
    await dataSource.query(`
      INSERT INTO artinfo_visitor_daily_activity (visitor_id, day, user_id, active_seconds, session_count, page_views) VALUES
        -- 관리자가 어제 로그아웃 상태로 쓴 브라우저 — 같은 브라우저라 뺀다
        ('v3', (now() AT TIME ZONE 'Asia/Seoul')::date - 1, NULL, 200, 1, 5),
        -- 비회원, 어제 5초 1페이지 — 참여 기준 미달
        ('v4', (now() AT TIME ZONE 'Asia/Seoul')::date - 1, NULL, 5, 1, 1);
    `);
  });

  afterAll(async () => {
    await dataSource?.destroy();
  });

  it('overview — 회원 2명(관리자·탈퇴 제외), 로그인 사용자 7일 1명 · 30일 2명', async () => {
    const r = await repository.overview();
    expect(r.users).toBe(2);
    expect(r.users_7d).toBe(1);
    expect(r.users_30d).toBe(1);
    expect(r.active_users_7d).toBe(1);
    expect(r.active_users_30d).toBe(2);
  });

  it('daily — 관리자가 가입·로그인한 어제는 0, 회원B 가 가입한 이틀 전은 1', async () => {
    const rows = await repository.daily(7);
    const count = (date: string, metric: string) => rows.find(r => r.date === date && r.metric === metric)?.count ?? 0;
    expect(count(await day(2), 'signups')).toBe(1);
    expect(count(await day(1), 'signups')).toBe(0);
    expect(count(await day(2), 'activeUsers')).toBe(1);
    expect(count(await day(1), 'activeUsers')).toBe(0);
    expect(count(await day(0), 'activeUsers')).toBe(0);
  });

  it('loginsByType — EMAIL(관리자만) 은 나오지 않는다', async () => {
    const rows = await repository.loginsByType();
    expect(rows).toEqual([
      { type: 'GOOGLE', count: 1 },
      { type: 'KAKAO', count: 1 },
    ]);
  });

  it('recentUsers — 관리자는 최근 가입에 없다', async () => {
    const rows = await repository.recentUsers(10);
    expect(rows.map(r => r.id)).toEqual([2, 1]);
  });

  it('engagementSummary — DAU 2 (회원A·비회원), 회원 DAU 1, 7일 평균 체류 90초', async () => {
    const s = await repository.engagementSummary();
    expect(s).toEqual({ dau: 2, wau: 2, mau: 2, member_dau: 1, member_wau: 1, member_mau: 1, avg_seconds_7d: 90 });
  });

  it('engagementDaily — 오늘 방문자 2·회원 1·180초, 어제는 관리자·미참여만이라 행이 없다', async () => {
    const rows = await repository.engagementDaily(7);
    expect(rows).toEqual([{ date: await day(0), visitors: 2, members: 1, seconds: 180 }]);
  });

  it('retention — 첫 방문 주 코호트 크기 합이 2 (관리자 브라우저 제외)', async () => {
    const { sizes } = await repository.retention('2000-01-01');
    expect(sizes.reduce((n, s) => n + Number(s.size), 0)).toBe(2);
  });

  it('visitors — 오늘 목록은 2명, 회원A 의 마지막 페이지는 /jobs/1', async () => {
    const { total, rows } = await repository.visitors(await day(0), 50, 0);
    expect(total).toBe(2);
    expect(rows.map(r => r.visitorId).sort()).toEqual(['v1', 'v2']);
    const a = rows.find(r => r.visitorId === 'v1')!;
    expect(a.nickname).toBe('회원A');
    expect(a.landingPath).toBe('/');
    expect(a.exitPath).toBe('/jobs/1');
    expect(a.engaged).toBe(true);
  });
});
