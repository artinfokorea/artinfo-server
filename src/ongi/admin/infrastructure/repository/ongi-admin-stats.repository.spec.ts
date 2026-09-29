import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { DataSource } from 'typeorm';
import { OngiAdminRepository } from '@/ongi/admin/infrastructure/repository/ongi-admin.repository';
import { OngiActivityRepository } from '@/ongi/activity/infrastructure/repository/ongi-activity.repository';
import { OngiSchemaBootstrapService } from '@/ongi/common/ongi-schema-bootstrap.service';

/**
 * 지표 SQL 을 실제 PostgreSQL 에서 확인한다. DB 가 있어야 해서 ONGI_TEST_DB_URL 을 줄 때만 돈다 (CI 에서는 건너뜀).
 *   docker run -d --name ongi-stats-pg -e POSTGRES_PASSWORD=test -p 55439:5432 postgres:16-alpine
 *   ONGI_TEST_DB_URL=postgres://postgres:test@localhost:55439/postgres npx jest ongi-admin-stats.repository
 * DB 세션 시간대는 ONGI_TEST_DB_TZ 로 바꿔 볼 수 있다 (기본 UTC) — 시간대가 달라도 결과가 같아야 한다.
 * 주의: 테스트용 빈 DB 에만 쓸 것 — ongi_ 테이블을 지우고 다시 만든다.
 */
const DB_URL = process.env.ONGI_TEST_DB_URL;
const DB_TZ = process.env.ONGI_TEST_DB_TZ ?? 'UTC';
const run = DB_URL ? describe : describe.skip;

const ddlFiles = (dir: string): string[] =>
  readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return ddlFiles(path);

    return name.endsWith('.ddl.sql') ? [path] : [];
  });

run(`지표 SQL (DB 시간대 ${DB_TZ})`, () => {
  let dataSource: DataSource;
  let admin: OngiAdminRepository;
  let activity: OngiActivityRepository;

  /** 한국 시간 오늘에서 daysAgo 일 전 날짜 */
  const day = async (daysAgo: number): Promise<string> => {
    const [row] = await dataSource.query(`SELECT to_char((now() AT TIME ZONE 'Asia/Seoul')::date - $1::int, 'YYYY-MM-DD') AS "day"`, [daysAgo]);

    return row.day;
  };

  beforeAll(async () => {
    dataSource = new DataSource({ type: 'postgres', url: DB_URL, extra: { options: `-c timezone=${DB_TZ}` } });
    await dataSource.initialize();
    await dataSource.query(`DROP SCHEMA public CASCADE; CREATE SCHEMA public;`);
    for (const file of ddlFiles(join(__dirname, '../../..')).sort()) await dataSource.query(readFileSync(file, 'utf8'));
    await new OngiSchemaBootstrapService(dataSource).onModuleInit();
    admin = new OngiAdminRepository(dataSource);
    activity = new OngiActivityRepository(dataSource);

    const ago = (days: number) => `now() - interval '${days} days'`;
    // 한국 시간 오늘 00:30 — UTC 로는 어제 15:30 이라 시간대를 바꾸지 않으면 어제 가입으로 잘못 센다
    const kstTodayEarly = `(((now() AT TIME ZONE 'Asia/Seoul')::date + interval '30 minutes') AT TIME ZONE 'Asia/Seoul') AT TIME ZONE current_setting('TimeZone')`;

    await dataSource.query(`
      INSERT INTO ongi_users (id, name, sns_type, sns_id, created_at, deleted_at) VALUES
        (1, '엄마', 'kakao', 'k1', ${ago(40)}, NULL),
        (2, '아빠', 'kakao', 'k2', ${ago(8)}, NULL),
        (3, '딸', 'google', 'g3', ${ago(2)}, NULL),
        (4, '아들', 'apple', 'a4', ${ago(1)}, NULL),
        (5, '친구', 'kakao', 'k5', ${ago(3)}, NULL),
        (6, '옛친구', 'kakao', 'k6', ${ago(31)}, NULL),
        (7, '탈퇴한 사용자', 'kakao', 'deleted-7', ${ago(2)}, now()),
        (8, '새벽 가입', 'kakao', 'k8', ${kstTodayEarly}, NULL);

      INSERT INTO ongi_auths (type, user_id, access_token, access_token_expires_in, refresh_token, refresh_token_expires_in) VALUES
        ('kakao', 1, 'tok-u1', now() + interval '1 hour', 'ref-u1', now() + interval '60 days'),
        ('kakao', 6, 'tok-u6', now() + interval '1 hour', 'ref-u6', now() + interval '60 days'),
        ('kakao', 7, 'tok-u7', now() + interval '1 hour', 'ref-u7', now() + interval '60 days');

      INSERT INTO ongi_groups (id, name, invite_code, invite_expires_at, deleted_at) VALUES
        (1, '우리 가족', 'ONGI-AAAA', now() + interval '7 days', NULL),
        (2, '혼자지만 활발', 'ONGI-BBBB', now() + interval '7 days', NULL),
        (3, '혼자이고 조용', 'ONGI-CCCC', now() + interval '7 days', NULL),
        (4, '지워진 공간', 'ONGI-DDDD', now() + interval '7 days', now()),
        (5, '한 명이 나간 공간', 'ONGI-EEEE', now() + interval '7 days', NULL);

      INSERT INTO ongi_members (id, group_id, user_id, name, deleted_at) VALUES
        (11, 1, 1, '엄마', NULL), (12, 1, 2, '아빠', NULL),
        (13, 2, 3, '딸', NULL),
        (15, 3, 5, '친구', NULL),
        (16, 4, 6, '옛친구', NULL),
        (14, 5, 4, '아들', NULL), (17, 5, 7, '탈퇴한 사용자', now());

      INSERT INTO ongi_photos (id, group_id, author_member_id, url, created_at) VALUES
        (101, 1, 11, 'https://x/1.jpg', ${ago(1)}),
        (102, 2, 13, 'https://x/2.jpg', ${ago(10)});
      INSERT INTO ongi_photo_comments (photo_id, author_member_id, text, created_at) VALUES (102, 13, '좋아요', ${ago(2)});

      INSERT INTO ongi_chat_messages (room_id, sender_user_id, type, content) VALUES
        (1, 2, 'text', '안녕'),
        (1, NULL, 'system', '아빠 님이 들어왔어요');

      INSERT INTO ongi_push_tokens (user_id, token, platform) VALUES (3, 'ExponentPushToken[u3]', 'android');

      INSERT INTO ongi_user_daily_activity (user_id, day, foreground_seconds, session_count, platform, app_version) VALUES
        (1, (now() AT TIME ZONE 'Asia/Seoul')::date - 9, 0, 0, NULL, NULL),
        (1, (now() AT TIME ZONE 'Asia/Seoul')::date - 1, 0, 0, NULL, NULL),
        (1, (now() AT TIME ZONE 'Asia/Seoul')::date, 600, 3, 'ios', '1.0.10'),
        (2, (now() AT TIME ZONE 'Asia/Seoul')::date - 8, 0, 0, NULL, NULL),
        (2, (now() AT TIME ZONE 'Asia/Seoul')::date - 7, 0, 0, NULL, NULL),
        (2, (now() AT TIME ZONE 'Asia/Seoul')::date - 1, 0, 0, NULL, NULL),
        (3, (now() AT TIME ZONE 'Asia/Seoul')::date - 2, 0, 0, NULL, NULL),
        (3, (now() AT TIME ZONE 'Asia/Seoul')::date - 1, 0, 0, NULL, NULL),
        (3, (now() AT TIME ZONE 'Asia/Seoul')::date, 0, 0, NULL, NULL),
        (4, (now() AT TIME ZONE 'Asia/Seoul')::date - 1, 0, 0, NULL, NULL),
        (5, (now() AT TIME ZONE 'Asia/Seoul')::date - 3, 0, 0, NULL, NULL),
        (7, (now() AT TIME ZONE 'Asia/Seoul')::date - 2, 0, 0, NULL, NULL);
    `);
  });

  afterAll(async () => {
    await dataSource?.destroy();
  });

  it('접속자 — 오늘 2명 · 7일 6명 · 30일 6명, 기록 시작은 9일 전', async () => {
    expect(await admin.getActivitySummary()).toEqual({ today: await day(0), trackingSince: await day(9), dau: 2, wau: 6, mau: 6 });
  });

  it('일별 접속 — 오늘은 2명 중 1명만 사용 시간을 보냈다', async () => {
    const rows = await admin.scanDailyActivity(30);
    const byDay = new Map(rows.map(row => [row.day, row]));

    expect(byDay.get(await day(0))).toEqual({ day: await day(0), activeUsers: 2, measuredUsers: 1, seconds: 600, sessions: 3 });
    expect(byDay.get(await day(1))).toEqual({ day: await day(1), activeUsers: 4, measuredUsers: 0, seconds: 0, sessions: 0 });
    expect(rows).toHaveLength(7);
  });

  it('일별 접속 — 기간 밖은 빼고 오늘을 포함해 센다 (2일 = 어제와 오늘)', async () => {
    const rows = await admin.scanDailyActivity(2);

    expect(rows.map(row => row.day).sort()).toEqual([await day(1), await day(0)]);
  });

  it('일별 콘텐츠 — 한국 날짜로 나눈다, 시스템 메시지는 빼고, 30일 밖의 가입은 뺀다', async () => {
    const rows = await admin.scanDailyContent(30);
    const byDay = new Map(rows.map(row => [row.day, row]));

    expect(byDay.get(await day(0))).toEqual({ day: await day(0), signups: 1, photos: 0, comments: 0, chatMessages: 1 });
    expect(byDay.get(await day(1))).toEqual({ day: await day(1), signups: 1, photos: 1, comments: 0, chatMessages: 0 });
    expect(byDay.get(await day(2))).toEqual({ day: await day(2), signups: 2, photos: 0, comments: 1, chatMessages: 0 });
    expect(byDay.get(await day(3))).toEqual({ day: await day(3), signups: 1, photos: 0, comments: 0, chatMessages: 0 });
    expect(byDay.get(await day(8))).toEqual({ day: await day(8), signups: 1, photos: 0, comments: 0, chatMessages: 0 });
    expect(byDay.get(await day(10))).toEqual({ day: await day(10), signups: 0, photos: 1, comments: 0, chatMessages: 0 });
    expect(rows).toHaveLength(6);
  });

  it('재방문율 — 1일: 4명 중 2명, 7일: 1명 중 1명, 30일: 1명 중 0명', async () => {
    const rows = await admin.scanRetention(30);

    expect(rows.sort((a, b) => a.days - b.days)).toEqual([
      { days: 1, cohort: 4, retained: 2 },
      { days: 7, cohort: 1, retained: 1 },
      { days: 30, cohort: 1, retained: 0 },
    ]);
  });

  it('공간 — 지워진 공간은 빼고 4곳, 혼자 3곳, 최근 7일 활동 2곳, 구성원 합 5명', async () => {
    expect(await admin.getSpaceStats()).toEqual({ total: 4, solo: 3, active7d: 2, members: 5 });
  });

  it('가입 후 전환 — 탈퇴한 사용자는 빼고 7명', async () => {
    expect(await admin.getFunnel()).toEqual({ users: 7, withGroup: 5, withPhoto: 2, withChat: 1, withPush: 1 });
  });

  it('플랫폼 — 앱이 보낸 값, 없으면 푸시 토큰, 그것도 없으면 null', async () => {
    expect(await admin.scanPlatforms(30)).toEqual([
      { platform: null, users: 4 },
      { platform: 'android', users: 1 },
      { platform: 'ios', users: 1 },
    ]);
  });

  it('앱 버전 — 사용 시간을 보내지 않는 버전은 null', async () => {
    expect(await admin.scanVersions(30)).toEqual([
      { version: null, users: 5 },
      { version: '1.0.10', users: 1 },
    ]);
  });

  describe('활동 기록', () => {
    const rowOf = async (userId: number) => {
      const [row] = await dataSource.query(
        `SELECT foreground_seconds AS "seconds", session_count AS "sessions", platform, app_version AS "appVersion"
           FROM ongi_user_daily_activity WHERE user_id = $1 AND day = (now() AT TIME ZONE 'Asia/Seoul')::date`,
        [userId],
      );

      return row ?? null;
    };

    it('온기 세션의 토큰이면 오늘 접속으로 기록한다', async () => {
      await activity.touch(6, 'tok-u6');

      expect(await rowOf(6)).toEqual({ seconds: 0, sessions: 0, platform: null, appVersion: null });
    });

    it('다시 기록해도 행은 하나, 이미 쌓인 사용 시간은 그대로', async () => {
      await activity.touch(1, 'tok-u1');
      await activity.touch(1, 'tok-u1');

      expect(await rowOf(1)).toEqual({ seconds: 600, sessions: 3, platform: 'ios', appVersion: '1.0.10' });
    });

    it('그 사용자의 토큰이 아니면 기록하지 않는다 — 다른 서비스 토큰의 id 가 겹치는 경우', async () => {
      await activity.touch(8, 'tok-u1');
      await activity.touch(8, 'unknown-token');

      expect(await rowOf(8)).toBeNull();
    });

    it('탈퇴한 사용자는 기록하지 않는다', async () => {
      await activity.touch(7, 'tok-u7');

      expect(await rowOf(7)).toBeNull();
    });

    it('사용 시간과 방문 수는 더해진다, 플랫폼·버전은 새 값이 있을 때만 바뀐다', async () => {
      await activity.addPing({ userId: 2, seconds: 0, sessions: 1, platform: 'android', appVersion: '1.0.10' });
      await activity.addPing({ userId: 2, seconds: 60, sessions: 0, platform: null, appVersion: null });
      await activity.addPing({ userId: 2, seconds: 45, sessions: 0, platform: 'android', appVersion: '1.0.11' });

      expect(await rowOf(2)).toEqual({ seconds: 105, sessions: 1, platform: 'android', appVersion: '1.0.11' });
    });

    it('하루 사용 시간은 24시간을 넘지 않는다', async () => {
      await dataSource.query(
        `UPDATE ongi_user_daily_activity SET foreground_seconds = 86000 WHERE user_id = 2 AND day = (now() AT TIME ZONE 'Asia/Seoul')::date`,
      );
      await activity.addPing({ userId: 2, seconds: 1800, sessions: 0, platform: null, appVersion: null });

      expect((await rowOf(2)).seconds).toBe(86400);
    });
  });
});
