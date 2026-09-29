import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  IOngiAdminRepository,
  OngiAdminAccessLogRow,
  OngiAdminActivitySummary,
  OngiAdminDailyActivityRow,
  OngiAdminDailyContentRow,
  OngiAdminDashboardTotals,
  OngiAdminFunnel,
  OngiAdminGroupMemberRow,
  OngiAdminGroupRow,
  OngiAdminInquiryRow,
  OngiAdminPage,
  OngiAdminPhotoRow,
  OngiAdminReportRow,
  OngiAdminSpaceStats,
  OngiAdminUserGroupRow,
  OngiAdminUserRow,
} from '@/ongi/admin/domain/repository/ongi-admin.repository.interface';
import { OngiAdminUserSort } from '@/ongi/admin/domain/service/ongi-admin-policy';

/** 지표의 하루는 한국 시간 — now() 는 timestamptz 라 DB 세션 시간대와 상관없이 한국 날짜가 나온다 */
const KST_TODAY = `(now() AT TIME ZONE 'Asia/Seoul')::date`;

/** created_at 같은 timestamp(시간대 없음) 컬럼은 DB 세션 시간대로 쓰여 있다 — 그 시간대로 읽어 한국 날짜로 바꾼다 */
const kstDateOf = (column: string) => `((${column} AT TIME ZONE current_setting('TimeZone')) AT TIME ZONE 'Asia/Seoul')::date`;

/**
 * 수치에서 테스트 계정을 빼는 조건들 — 운영 현황과 지표가 같이 쓴다.
 * 접속 기록 자체는 테스트 계정도 남긴다 (지정을 풀면 그동안의 기록이 수치에 돌아온다).
 */
const TEST_USER_IDS = `(SELECT id FROM ongi_users WHERE is_test)`;
const TEST_MEMBER_IDS = `(SELECT m.id FROM ongi_members m JOIN ongi_users u ON u.id = m.user_id WHERE u.is_test)`;
const notTestUser = (column: string) => `${column} NOT IN ${TEST_USER_IDS}`;
const notTestMember = (column: string) => `${column} NOT IN ${TEST_MEMBER_IDS}`;
/** 테스트 계정뿐인 공간이 아니다 — 구성원이 없는 공간은 남긴다 */
const notTestOnlyGroup = (alias: string) =>
  `(EXISTS (SELECT 1 FROM ongi_members m WHERE m.group_id = ${alias}.id AND m.deleted_at IS NULL AND ${notTestUser('m.user_id')})
    OR NOT EXISTS (SELECT 1 FROM ongi_members m WHERE m.group_id = ${alias}.id AND m.deleted_at IS NULL))`;
/** 테스트 계정을 뺀 활동 기록 */
const REAL_ACTIVITY = `(SELECT * FROM ongi_user_daily_activity WHERE ${notTestUser('user_id')})`;

/** 관리자 조회는 여러 도메인 테이블을 가로지르는 읽기 전용 집계라 raw SQL 로 모은다 */
@Injectable()
export class OngiAdminRepository implements IOngiAdminRepository {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async findSessionByAccessToken(accessToken: string): Promise<{ userId: number } | null> {
    const [row] = await this.dataSource.query(`SELECT user_id AS "userId" FROM ongi_auths WHERE access_token = $1 LIMIT 1`, [accessToken]);

    return row ?? null;
  }

  async findUserTypeById(userId: number): Promise<{ id: number; name: string; type: string; deletedAt: Date | null } | null> {
    const [row] = await this.dataSource.query(`SELECT id, name, type, deleted_at AS "deletedAt" FROM ongi_users WHERE id = $1`, [userId]);

    return row ?? null;
  }

  async getDashboardTotals(): Promise<OngiAdminDashboardTotals> {
    const [row] = await this.dataSource.query(
      `SELECT
         (SELECT count(*) FROM ongi_users WHERE deleted_at IS NULL AND NOT is_test)::int AS "users",
         (SELECT count(*) FROM ongi_users WHERE deleted_at IS NULL AND NOT is_test AND created_at >= now() - interval '7 days')::int AS "newUsers7d",
         (SELECT count(*) FROM ongi_groups g WHERE g.deleted_at IS NULL AND ${notTestOnlyGroup('g')})::int AS "groups",
         (SELECT count(*) FROM ongi_photos WHERE deleted_at IS NULL AND media_type <> 'video' AND ${notTestMember('author_member_id')})::int AS "photos",
         (SELECT count(*) FROM ongi_photos WHERE deleted_at IS NULL AND media_type = 'video' AND ${notTestMember('author_member_id')})::int AS "videos",
         (SELECT count(*) FROM ongi_photo_comments WHERE deleted_at IS NULL AND ${notTestMember('author_member_id')})::int AS "comments",
         (SELECT count(*) FROM ongi_reports WHERE status = 'open')::int AS "openReports",
         (SELECT count(*) FROM ongi_inquiries WHERE answer IS NULL)::int AS "openInquiries"`,
    );

    return row;
  }

  async scanDailySignups(days: number): Promise<{ day: string; count: number }[]> {
    return this.dataSource.query(
      `SELECT to_char(created_at::date, 'YYYY-MM-DD') AS "day", count(*)::int AS "count"
         FROM ongi_users
        WHERE created_at >= current_date - ($1::int - 1) AND NOT is_test
        GROUP BY 1`,
      [days],
    );
  }

  async todayKey(): Promise<string> {
    const [row] = await this.dataSource.query(`SELECT to_char(current_date, 'YYYY-MM-DD') AS "day"`);

    return row.day;
  }

  async getActivitySummary(): Promise<OngiAdminActivitySummary> {
    const [row] = await this.dataSource.query(
      `WITH t AS (SELECT ${KST_TODAY} AS today)
       SELECT to_char(t.today, 'YYYY-MM-DD') AS "today",
              (SELECT to_char(min(day), 'YYYY-MM-DD') FROM ${REAL_ACTIVITY} a) AS "trackingSince",
              (SELECT count(*) FROM ${REAL_ACTIVITY} a WHERE day = t.today)::int AS "dau",
              (SELECT count(DISTINCT user_id) FROM ${REAL_ACTIVITY} a WHERE day > t.today - 7)::int AS "wau",
              (SELECT count(DISTINCT user_id) FROM ${REAL_ACTIVITY} a WHERE day > t.today - 30)::int AS "mau"
         FROM t`,
    );

    return row;
  }

  async scanDailyActivity(days: number): Promise<OngiAdminDailyActivityRow[]> {
    return this.dataSource.query(
      `SELECT to_char(day, 'YYYY-MM-DD') AS "day",
              count(*)::int AS "activeUsers",
              (count(*) FILTER (WHERE session_count > 0 OR foreground_seconds > 0))::int AS "measuredUsers",
              COALESCE(sum(foreground_seconds), 0)::int AS "seconds",
              COALESCE(sum(session_count), 0)::int AS "sessions"
         FROM ${REAL_ACTIVITY} a
        WHERE day > ${KST_TODAY} - $1::int
        GROUP BY day`,
      [days],
    );
  }

  /** 지운 사진·댓글도 센다 — 그날 있었던 활동량을 보는 수치다. 여러 공간에 함께 올린 사진은 공간마다 1장 */
  async scanDailyContent(days: number): Promise<OngiAdminDailyContentRow[]> {
    const recent = `created_at >= now() - make_interval(days => $1::int + 1)`;

    return this.dataSource.query(
      `WITH events AS (
         SELECT ${kstDateOf('created_at')} AS day, 'signups' AS kind FROM ongi_users WHERE ${recent} AND NOT is_test
         UNION ALL
         SELECT ${kstDateOf('created_at')}, 'photos' FROM ongi_photos WHERE ${recent} AND ${notTestMember('author_member_id')}
         UNION ALL
         SELECT ${kstDateOf('created_at')}, 'comments' FROM ongi_photo_comments WHERE ${recent} AND ${notTestMember('author_member_id')}
         UNION ALL
         SELECT ${kstDateOf('created_at')}, 'chatMessages' FROM ongi_chat_messages
          WHERE type <> 'system' AND ${recent} AND ${notTestUser('sender_user_id')}
       )
       SELECT to_char(day, 'YYYY-MM-DD') AS "day",
              (count(*) FILTER (WHERE kind = 'signups'))::int AS "signups",
              (count(*) FILTER (WHERE kind = 'photos'))::int AS "photos",
              (count(*) FILTER (WHERE kind = 'comments'))::int AS "comments",
              (count(*) FILTER (WHERE kind = 'chatMessages'))::int AS "chatMessages"
         FROM events
        WHERE day > ${KST_TODAY} - $1::int
        GROUP BY day`,
      [days],
    );
  }

  /** 오늘은 아직 끝나지 않았으므로 N일째가 어제까지인 가입자만 본다. 탈퇴한 사용자도 대상에 남는다 (돌아오지 않은 사람이다) */
  async scanRetention(windowDays: number): Promise<{ days: number; cohort: number; retained: number }[]> {
    return this.dataSource.query(
      `WITH t AS (SELECT ${KST_TODAY} AS today, (SELECT min(day) FROM ${REAL_ACTIVITY} a) AS since),
            cohort AS (SELECT id, ${kstDateOf('created_at')} AS signup_day FROM ongi_users WHERE NOT is_test)
       SELECT n.days AS "days", count(*)::int AS "cohort", count(a.user_id)::int AS "retained"
         FROM t
         CROSS JOIN (VALUES (1), (7), (30)) AS n(days)
         JOIN cohort c ON c.signup_day + n.days BETWEEN GREATEST(t.since, t.today - $1::int) AND t.today - 1
         LEFT JOIN ongi_user_daily_activity a ON a.user_id = c.id AND a.day = c.signup_day + n.days
        WHERE t.since IS NOT NULL
        GROUP BY n.days`,
      [windowDays],
    );
  }

  async getSpaceStats(): Promise<OngiAdminSpaceStats> {
    const [row] = await this.dataSource.query(
      `WITH spaces AS (
         SELECT g.id,
                (SELECT count(*) FROM ongi_members m WHERE m.group_id = g.id AND m.deleted_at IS NULL AND ${notTestUser('m.user_id')}) AS members,
                (EXISTS (SELECT 1 FROM ongi_photos p
                          WHERE p.group_id = g.id AND p.created_at >= now() - interval '7 days' AND ${notTestMember('p.author_member_id')})
                 OR EXISTS (SELECT 1 FROM ongi_photo_comments c JOIN ongi_photos p ON p.id = c.photo_id
                             WHERE p.group_id = g.id AND c.created_at >= now() - interval '7 days' AND ${notTestMember('c.author_member_id')})) AS active
           FROM ongi_groups g
          WHERE g.deleted_at IS NULL AND ${notTestOnlyGroup('g')}
       )
       SELECT count(*)::int AS "total",
              (count(*) FILTER (WHERE members <= 1))::int AS "solo",
              (count(*) FILTER (WHERE active))::int AS "active7d",
              COALESCE(sum(members), 0)::int AS "members"
         FROM spaces`,
    );

    return row;
  }

  async getFunnel(): Promise<OngiAdminFunnel> {
    const [row] = await this.dataSource.query(
      `SELECT count(*)::int AS "users",
              (count(*) FILTER (WHERE EXISTS (SELECT 1 FROM ongi_members m JOIN ongi_groups g ON g.id = m.group_id
                                               WHERE m.user_id = u.id AND m.deleted_at IS NULL AND g.deleted_at IS NULL)))::int AS "withGroup",
              (count(*) FILTER (WHERE EXISTS (SELECT 1 FROM ongi_photos p JOIN ongi_members m ON m.id = p.author_member_id WHERE m.user_id = u.id)))::int AS "withPhoto",
              (count(*) FILTER (WHERE EXISTS (SELECT 1 FROM ongi_chat_messages c WHERE c.sender_user_id = u.id AND c.type <> 'system')))::int AS "withChat",
              (count(*) FILTER (WHERE EXISTS (SELECT 1 FROM ongi_push_tokens t WHERE t.user_id = u.id)))::int AS "withPush"
         FROM ongi_users u
        WHERE u.deleted_at IS NULL AND NOT u.is_test`,
    );

    return row;
  }

  async countTestUsers(): Promise<number> {
    const [row] = await this.dataSource.query(`SELECT count(*)::int AS "count" FROM ongi_users WHERE is_test`);

    return row.count;
  }

  async scanPlatforms(days: number): Promise<{ platform: string | null; users: number }[]> {
    return this.dataSource.query(
      `WITH latest AS (
         SELECT DISTINCT ON (user_id) user_id, platform
           FROM ${REAL_ACTIVITY} a
          WHERE day > ${KST_TODAY} - $1::int
          ORDER BY user_id, (platform IS NULL), day DESC
       )
       SELECT COALESCE(l.platform, (SELECT t.platform FROM ongi_push_tokens t WHERE t.user_id = l.user_id ORDER BY t.updated_at DESC LIMIT 1)) AS "platform",
              count(*)::int AS "users"
         FROM latest l
        GROUP BY 1
        ORDER BY 2 DESC, 1`,
      [days],
    );
  }

  async scanVersions(days: number): Promise<{ version: string | null; users: number }[]> {
    return this.dataSource.query(
      `WITH latest AS (
         SELECT DISTINCT ON (user_id) user_id, app_version
           FROM ${REAL_ACTIVITY} a
          WHERE day > ${KST_TODAY} - $1::int
          ORDER BY user_id, (app_version IS NULL), day DESC
       )
       SELECT app_version AS "version", count(*)::int AS "users"
         FROM latest
        GROUP BY 1
        ORDER BY 2 DESC, 1`,
      [days],
    );
  }

  async scanReports(status: string | null, page: OngiAdminPage): Promise<OngiAdminReportRow[]> {
    return this.dataSource.query(
      `SELECT r.id, r.status, r.reason, r.created_at AS "createdAt",
              r.reporter_user_id AS "reporterUserId", reporter.name AS "reporterName",
              r.target_type AS "targetType", r.target_id AS "targetId",
              COALESCE(p.id, cp.id) AS "photoId",
              COALESCE(p.url, cp.url) AS "photoUrl",
              COALESCE(p.thumb_url, cp.thumb_url) AS "photoThumbUrl",
              COALESCE(p.media_type, cp.media_type) AS "photoMediaType",
              COALESCE(p.caption, cp.caption) AS "photoCaption",
              COALESCE(c.text, CASE WHEN chm.type = 'photo' THEN '[사진]' ELSE chm.content END) AS "commentText",
              COALESCE(pm.name, cm.name, tm.name, chu.name) AS "targetName",
              COALESCE(pm.user_id, cm.user_id, tm.user_id, chm.sender_user_id) AS "targetUserId",
              g.id AS "groupId", g.name AS "groupName",
              CASE r.target_type
                WHEN 'photo' THEN p.id IS NULL OR p.deleted_at IS NOT NULL
                WHEN 'comment' THEN c.id IS NULL OR c.deleted_at IS NOT NULL
                WHEN 'chat_message' THEN chm.id IS NULL
                ELSE tm.id IS NULL OR tm.deleted_at IS NOT NULL
              END AS "targetDeleted"
         FROM ongi_reports r
         LEFT JOIN ongi_users reporter ON reporter.id = r.reporter_user_id
         LEFT JOIN ongi_photos p ON r.target_type = 'photo' AND p.id = r.target_id
         LEFT JOIN ongi_members pm ON pm.id = p.author_member_id
         LEFT JOIN ongi_photo_comments c ON r.target_type = 'comment' AND c.id = r.target_id
         LEFT JOIN ongi_members cm ON cm.id = c.author_member_id
         LEFT JOIN ongi_photos cp ON cp.id = c.photo_id
         LEFT JOIN ongi_members tm ON r.target_type = 'member' AND tm.id = r.target_id
         LEFT JOIN ongi_chat_messages chm ON r.target_type = 'chat_message' AND chm.id = r.target_id
         LEFT JOIN ongi_users chu ON chu.id = chm.sender_user_id
         LEFT JOIN ongi_groups g ON g.id = COALESCE(p.group_id, cp.group_id, tm.group_id)
        WHERE ($1::varchar IS NULL OR r.status = $1)
        ORDER BY r.created_at DESC
        LIMIT $2 OFFSET $3`,
      [status, page.limit, page.offset],
    );
  }

  async findReportById(id: number): Promise<{ id: number; targetType: string; targetId: number; status: string } | null> {
    const [row] = await this.dataSource.query(`SELECT id, target_type AS "targetType", target_id AS "targetId", status FROM ongi_reports WHERE id = $1`, [id]);

    return row ?? null;
  }

  async updateReportStatus(id: number, status: string): Promise<void> {
    await this.dataSource.query(`UPDATE ongi_reports SET status = $2, updated_at = now() WHERE id = $1`, [id, status]);
  }

  private readonly userSelect = `
    SELECT u.id, u.name, u.email, u.sns_type AS "snsType", u.type, u.is_test AS "isTest", u.created_at AS "createdAt", u.deleted_at AS "deletedAt",
           seen.at AS "lastSeenAt",
           (SELECT count(*) FROM ongi_members m WHERE m.user_id = u.id AND m.deleted_at IS NULL)::int AS "groupCount",
           (SELECT count(*) FROM ongi_photos p JOIN ongi_members m ON m.id = p.author_member_id
             WHERE m.user_id = u.id AND p.deleted_at IS NULL)::int AS "photoCount",
           COALESCE((SELECT json_agg(json_build_object('groupId', g.id, 'groupName', g.name, 'memberName', m.name, 'role', m.role) ORDER BY m.created_at, m.id)
                       FROM ongi_members m JOIN ongi_groups g ON g.id = m.group_id
                      WHERE m.user_id = u.id AND m.deleted_at IS NULL AND g.deleted_at IS NULL), '[]'::json) AS "groups"
      FROM ongi_users u
      -- last_seen_at 은 DB 세션 시간대로 쓰인 timestamp — 그 시간대로 읽어 시각(timestamptz)으로 내려야 서버 시간대와 달라도 맞다
      LEFT JOIN LATERAL (SELECT max(a.last_seen_at) AT TIME ZONE current_setting('TimeZone') AS at
                           FROM ongi_user_daily_activity a WHERE a.user_id = u.id) seen ON true`;

  async scanUsers(query: string | null, includeEmail: boolean, page: OngiAdminPage, sort: OngiAdminUserSort = 'joined'): Promise<OngiAdminUserRow[]> {
    // 정렬 기준은 값이 아니라 SQL 조각이라 매개변수로 못 넣는다 — 허용한 두 가지 중에서만 고른다
    const orderBy = sort === 'seen' ? 'seen.at DESC NULLS LAST, u.id DESC' : 'u.id DESC';

    return this.dataSource.query(
      `${this.userSelect}
        WHERE $1::varchar IS NULL
           OR u.name ILIKE '%' || $1 || '%'
           OR u.id::varchar = $1
           OR ($2::boolean AND u.email ILIKE '%' || $1 || '%')
        ORDER BY ${orderBy}
        LIMIT $3 OFFSET $4`,
      [query, includeEmail, page.limit, page.offset],
    );
  }

  async findUserById(id: number): Promise<OngiAdminUserRow | null> {
    const [row] = await this.dataSource.query(`${this.userSelect} WHERE u.id = $1`, [id]);

    return row ?? null;
  }

  async scanUserGroups(userId: number): Promise<OngiAdminUserGroupRow[]> {
    return this.dataSource.query(
      `SELECT g.id AS "groupId", g.name AS "groupName", m.name AS "memberName", m.role, m.created_at AS "joinedAt"
         FROM ongi_members m JOIN ongi_groups g ON g.id = m.group_id
        WHERE m.user_id = $1 AND m.deleted_at IS NULL AND g.deleted_at IS NULL
        ORDER BY m.created_at`,
      [userId],
    );
  }

  async updateUserTest(userId: number, isTest: boolean): Promise<void> {
    await this.dataSource.query(`UPDATE ongi_users SET is_test = $2, updated_at = now() WHERE id = $1`, [userId, isTest]);
  }

  async updateUserType(userId: number, type: string): Promise<void> {
    await this.dataSource.query(`UPDATE ongi_users SET type = $2, updated_at = now() WHERE id = $1`, [userId, type]);
  }

  private readonly groupSelect = `
    SELECT g.id, g.name, g.created_at AS "createdAt",
           (SELECT count(*) FROM ongi_members m WHERE m.group_id = g.id AND m.deleted_at IS NULL)::int AS "memberCount",
           (SELECT count(*) FROM ongi_photos p WHERE p.group_id = g.id AND p.deleted_at IS NULL)::int AS "photoCount",
           (SELECT max(p.created_at) FROM ongi_photos p WHERE p.group_id = g.id AND p.deleted_at IS NULL) AS "lastPhotoAt"
      FROM ongi_groups g`;

  async scanGroups(query: string | null, page: OngiAdminPage): Promise<OngiAdminGroupRow[]> {
    return this.dataSource.query(
      `${this.groupSelect}
        WHERE g.deleted_at IS NULL AND ($1::varchar IS NULL OR g.name ILIKE '%' || $1 || '%' OR g.id::varchar = $1)
        ORDER BY g.id DESC
        LIMIT $2 OFFSET $3`,
      [query, page.limit, page.offset],
    );
  }

  async findGroupById(id: number): Promise<OngiAdminGroupRow | null> {
    const [row] = await this.dataSource.query(`${this.groupSelect} WHERE g.id = $1 AND g.deleted_at IS NULL`, [id]);

    return row ?? null;
  }

  async scanGroupMembers(groupId: number): Promise<OngiAdminGroupMemberRow[]> {
    return this.dataSource.query(
      `SELECT m.id AS "memberId", m.user_id AS "userId", m.name, m.role, m.created_at AS "joinedAt",
              (SELECT count(*) FROM ongi_photos p WHERE p.author_member_id = m.id AND p.deleted_at IS NULL)::int AS "photoCount"
         FROM ongi_members m
        WHERE m.group_id = $1 AND m.deleted_at IS NULL
        ORDER BY m.created_at`,
      [groupId],
    );
  }

  /**
   * 가족 공간 삭제 — 공간에 딸린 데이터까지 한 트랜잭션에서 소프트 삭제한다.
   * - 트랜잭션 안의 now() 는 값이 같으므로, 함께 지워진 행은 공간과 deleted_at 이 같다 (복구할 때 이 값으로 고른다)
   * - 좋아요(ongi_photo_likes)는 deleted_at 이 없고 사진이 가려지면 노출되지 않으므로 그대로 둔다
   * - S3 원본은 지우지 않는다 — 소프트 삭제라 복구할 수 있어야 한다
   */
  async softDeleteGroup(groupId: number, adminUserId: number): Promise<void> {
    await this.dataSource.transaction(async manager => {
      await manager.query(
        `UPDATE ongi_photo_comments SET deleted_at = now()
          WHERE deleted_at IS NULL AND photo_id IN (SELECT id FROM ongi_photos WHERE group_id = $1)`,
        [groupId],
      );
      await manager.query(`UPDATE ongi_photos SET deleted_at = now() WHERE group_id = $1 AND deleted_at IS NULL`, [groupId]);
      await manager.query(`UPDATE ongi_albums SET deleted_at = now() WHERE group_id = $1 AND deleted_at IS NULL`, [groupId]);
      await manager.query(`UPDATE ongi_events SET deleted_at = now() WHERE group_id = $1 AND deleted_at IS NULL`, [groupId]);
      await manager.query(`UPDATE ongi_members SET deleted_at = now() WHERE group_id = $1 AND deleted_at IS NULL`, [groupId]);
      await manager.query(`UPDATE ongi_groups SET deleted_at = now() WHERE id = $1 AND deleted_at IS NULL`, [groupId]);
      await manager.query(`INSERT INTO ongi_admin_access_logs (admin_user_id, action, target_type, target_id) VALUES ($1, 'delete_group', 'group', $2)`, [
        adminUserId,
        groupId,
      ]);
    });
  }

  private readonly photoSelect = `
    SELECT p.id, p.group_id AS "groupId", g.name AS "groupName", p.author_member_id AS "authorMemberId",
           m.name AS "authorName", m.user_id AS "authorUserId",
           p.url, p.thumb_url AS "thumbUrl", p.media_type AS "mediaType", p.caption, p.created_at AS "createdAt"
      FROM ongi_photos p
      JOIN ongi_groups g ON g.id = p.group_id
      LEFT JOIN ongi_members m ON m.id = p.author_member_id`;

  async scanGroupPhotos(groupId: number, page: OngiAdminPage): Promise<OngiAdminPhotoRow[]> {
    return this.dataSource.query(
      `${this.photoSelect}
        WHERE p.group_id = $1 AND p.deleted_at IS NULL
        ORDER BY p.created_at DESC, p.id DESC
        LIMIT $2 OFFSET $3`,
      [groupId, page.limit, page.offset],
    );
  }

  async scanUserPhotos(userId: number, page: OngiAdminPage): Promise<OngiAdminPhotoRow[]> {
    return this.dataSource.query(
      `${this.photoSelect}
        WHERE m.user_id = $1 AND p.deleted_at IS NULL
        ORDER BY p.created_at DESC, p.id DESC
        LIMIT $2 OFFSET $3`,
      [userId, page.limit, page.offset],
    );
  }

  async createAccessLog(log: { adminUserId: number; action: string; targetType: string; targetId: number }): Promise<void> {
    await this.dataSource.query(`INSERT INTO ongi_admin_access_logs (admin_user_id, action, target_type, target_id) VALUES ($1, $2, $3, $4)`, [
      log.adminUserId,
      log.action,
      log.targetType,
      log.targetId,
    ]);
  }

  async scanAccessLogs(page: OngiAdminPage): Promise<OngiAdminAccessLogRow[]> {
    return this.dataSource.query(
      `SELECT l.id, l.admin_user_id AS "adminUserId", u.name AS "adminName", l.action, l.target_type AS "targetType", l.target_id AS "targetId",
              CASE l.target_type WHEN 'group' THEN g.name WHEN 'user' THEN tu.name END AS "targetName",
              l.created_at AS "createdAt"
         FROM ongi_admin_access_logs l
         LEFT JOIN ongi_users u ON u.id = l.admin_user_id
         LEFT JOIN ongi_groups g ON l.target_type = 'group' AND g.id = l.target_id
         LEFT JOIN ongi_users tu ON l.target_type = 'user' AND tu.id = l.target_id
        ORDER BY l.created_at DESC, l.id DESC
        LIMIT $1 OFFSET $2`,
      [page.limit, page.offset],
    );
  }

  private readonly inquirySelect = `
    SELECT i.id, i.user_id AS "userId", u.name AS "userName", u.email AS "userEmail", i.content, i.answer,
           a.name AS "answeredByName", i.answered_at AS "answeredAt", i.created_at AS "createdAt"
      FROM ongi_inquiries i
      LEFT JOIN ongi_users u ON u.id = i.user_id
      LEFT JOIN ongi_users a ON a.id = i.answered_by_user_id`;

  async scanInquiries(status: string | null, page: OngiAdminPage): Promise<OngiAdminInquiryRow[]> {
    return this.dataSource.query(
      `${this.inquirySelect}
        WHERE ($1::varchar IS NULL OR ($1 = 'open' AND i.answer IS NULL) OR ($1 = 'answered' AND i.answer IS NOT NULL))
        ORDER BY i.created_at DESC, i.id DESC
        LIMIT $2 OFFSET $3`,
      [status, page.limit, page.offset],
    );
  }

  async findInquiryById(id: number): Promise<OngiAdminInquiryRow | null> {
    const [row] = await this.dataSource.query(`${this.inquirySelect} WHERE i.id = $1`, [id]);

    return row ?? null;
  }

  async answerInquiry(id: number, answer: string, adminUserId: number): Promise<void> {
    await this.dataSource.query(`UPDATE ongi_inquiries SET answer = $2, answered_by_user_id = $3, answered_at = now(), updated_at = now() WHERE id = $1`, [
      id,
      answer,
      adminUserId,
    ]);
  }

  async scanConfigs(keys: readonly string[]): Promise<{ key: string; value: string }[]> {
    return this.dataSource.query(`SELECT key, value FROM ongi_configs WHERE key = ANY($1)`, [keys]);
  }

  async upsertConfig(key: string, value: string): Promise<void> {
    await this.dataSource.query(`INSERT INTO ongi_configs (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`, [key, value]);
  }
}
