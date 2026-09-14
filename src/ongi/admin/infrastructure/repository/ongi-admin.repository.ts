import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  IOngiAdminRepository,
  OngiAdminAccessLogRow,
  OngiAdminDashboardTotals,
  OngiAdminGroupMemberRow,
  OngiAdminGroupRow,
  OngiAdminInquiryRow,
  OngiAdminPage,
  OngiAdminPhotoRow,
  OngiAdminReportRow,
  OngiAdminUserGroupRow,
  OngiAdminUserRow,
} from '@/ongi/admin/domain/repository/ongi-admin.repository.interface';

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
         (SELECT count(*) FROM ongi_users WHERE deleted_at IS NULL)::int AS "users",
         (SELECT count(*) FROM ongi_users WHERE deleted_at IS NULL AND created_at >= now() - interval '7 days')::int AS "newUsers7d",
         (SELECT count(*) FROM ongi_groups WHERE deleted_at IS NULL)::int AS "groups",
         (SELECT count(*) FROM ongi_photos WHERE deleted_at IS NULL AND media_type <> 'video')::int AS "photos",
         (SELECT count(*) FROM ongi_photos WHERE deleted_at IS NULL AND media_type = 'video')::int AS "videos",
         (SELECT count(*) FROM ongi_photo_comments WHERE deleted_at IS NULL)::int AS "comments",
         (SELECT count(*) FROM ongi_reports WHERE status = 'open')::int AS "openReports",
         (SELECT count(*) FROM ongi_inquiries WHERE answer IS NULL)::int AS "openInquiries"`,
    );

    return row;
  }

  async scanDailySignups(days: number): Promise<{ day: string; count: number }[]> {
    return this.dataSource.query(
      `SELECT to_char(created_at::date, 'YYYY-MM-DD') AS "day", count(*)::int AS "count"
         FROM ongi_users
        WHERE created_at >= current_date - ($1::int - 1)
        GROUP BY 1`,
      [days],
    );
  }

  async todayKey(): Promise<string> {
    const [row] = await this.dataSource.query(`SELECT to_char(current_date, 'YYYY-MM-DD') AS "day"`);

    return row.day;
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
              c.text AS "commentText",
              COALESCE(pm.name, cm.name, tm.name) AS "targetName",
              COALESCE(pm.user_id, cm.user_id, tm.user_id) AS "targetUserId",
              g.id AS "groupId", g.name AS "groupName",
              CASE r.target_type
                WHEN 'photo' THEN p.id IS NULL OR p.deleted_at IS NOT NULL
                WHEN 'comment' THEN c.id IS NULL OR c.deleted_at IS NOT NULL
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
    SELECT u.id, u.name, u.email, u.sns_type AS "snsType", u.type, u.created_at AS "createdAt", u.deleted_at AS "deletedAt",
           (SELECT count(*) FROM ongi_members m WHERE m.user_id = u.id AND m.deleted_at IS NULL)::int AS "groupCount",
           (SELECT count(*) FROM ongi_photos p JOIN ongi_members m ON m.id = p.author_member_id
             WHERE m.user_id = u.id AND p.deleted_at IS NULL)::int AS "photoCount"
      FROM ongi_users u`;

  async scanUsers(query: string | null, includeEmail: boolean, page: OngiAdminPage): Promise<OngiAdminUserRow[]> {
    return this.dataSource.query(
      `${this.userSelect}
        WHERE $1::varchar IS NULL
           OR u.name ILIKE '%' || $1 || '%'
           OR u.id::varchar = $1
           OR ($2::boolean AND u.email ILIKE '%' || $1 || '%')
        ORDER BY u.id DESC
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
