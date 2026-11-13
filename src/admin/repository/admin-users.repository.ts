import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AdminUserFilter, AdminUserTarget, filterWhereSql, USER_HAS_APP_SQL, USER_PUSH_JOB_SQL } from '@/admin/domain/admin-users.policy';
import { USER_NOT_ADMIN_SQL } from '@/admin/domain/artinfo-admin-policy';

export interface AdminUsersSummaryRow {
  members: number;
  members_7d: number;
  admins: number;
  withdrawn: number;
  app_users: number;
  app_users_7d: number;
  app_users_ios: number;
  app_users_android: number;
  push_on: number;
  push_off: number;
  devices: number;
}

export interface AdminUserRow {
  id: number;
  type: string;
  name: string;
  nickname: string;
  email: string;
  phone: string | null;
  createdAt: Date;
  deletedAt: Date | null;
  lastLoginAt: Date | null;
  loginTypes: string[];
  deviceCount: number;
  platforms: string[];
  appInstalledAt: Date | null;
  pushJob: boolean;
}

export interface AdminUsersPage {
  total: number;
  rows: AdminUserRow[];
}

/** 회원 관리 — 목록·요약·역할 변경·탈퇴 처리. 지표 대시보드와 달리 관리자 계정도 목록에 나온다 */
@Injectable()
export class AdminUsersRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  /** 요약 — 회원 수는 대시보드와 같은 기준(탈퇴·관리자 제외). 앱 회원 = 푸시 토큰이 1개 이상인 회원 */
  async summary(): Promise<AdminUsersSummaryRow> {
    const rows: AdminUsersSummaryRow[] = await this.dataSource.query(`
      WITH app AS (
        SELECT t.user_id, min(t.created_at) AS installed_at,
               bool_or(t.platform = 'ios') AS has_ios, bool_or(t.platform = 'android') AS has_android
          FROM artinfo_push_tokens t
          JOIN users u ON u.id = t.user_id AND u.deleted_at IS NULL AND u.${USER_NOT_ADMIN_SQL}
         GROUP BY t.user_id
      )
      SELECT
        (SELECT count(*) FROM users u WHERE u.deleted_at IS NULL AND u.${USER_NOT_ADMIN_SQL})::int AS members,
        (SELECT count(*) FROM users u WHERE u.deleted_at IS NULL AND u.${USER_NOT_ADMIN_SQL} AND u.created_at >= now() - interval '7 days')::int AS members_7d,
        (SELECT count(*) FROM users u WHERE u.deleted_at IS NULL AND u.type = 'ADMIN')::int AS admins,
        (SELECT count(*) FROM users u WHERE u.deleted_at IS NOT NULL)::int AS withdrawn,
        (SELECT count(*) FROM app)::int AS app_users,
        (SELECT count(*) FROM app WHERE installed_at >= now() - interval '7 days')::int AS app_users_7d,
        (SELECT count(*) FROM app WHERE has_ios)::int AS app_users_ios,
        (SELECT count(*) FROM app WHERE has_android)::int AS app_users_android,
        (SELECT count(*) FROM app a WHERE COALESCE((SELECT p.job FROM artinfo_push_preferences p WHERE p.user_id = a.user_id), TRUE) = TRUE)::int AS push_on,
        (SELECT count(*) FROM app a WHERE COALESCE((SELECT p.job FROM artinfo_push_preferences p WHERE p.user_id = a.user_id), TRUE) = FALSE)::int AS push_off,
        (SELECT count(*) FROM artinfo_push_tokens t JOIN users u ON u.id = t.user_id AND u.deleted_at IS NULL AND u.${USER_NOT_ADMIN_SQL})::int AS devices
    `);
    return rows[0];
  }

  /**
   * 회원 목록 — 필터 + 검색(닉네임·이름·이메일 부분 일치, 대소문자 무시), 가입 최신순, 페이지네이션.
   * 마지막 로그인·로그인 방식은 auths, 기기·플랫폼은 artinfo_push_tokens, 채용 알림은 artinfo_push_preferences 에서 가져온다.
   */
  async findUsers(filter: AdminUserFilter, query: string | null, page: number, size: number): Promise<AdminUsersPage> {
    const where = [filterWhereSql(filter)];
    const params: unknown[] = [];
    if (query) {
      params.push(`%${query}%`);
      where.push(`(u.nickname ILIKE $1 OR u.name ILIKE $1 OR u.email ILIKE $1)`);
    }
    const whereSql = where.join(' AND ');

    const [{ total }] = await this.dataSource.query(`SELECT count(*)::int AS total FROM users u WHERE ${whereSql}`, params);

    const limitIndex = params.length + 1;
    const offsetIndex = params.length + 2;
    const rows: AdminUserRow[] = await this.dataSource.query(
      `SELECT u.id, u.type, u.name, u.nickname, u.email, u.phone,
              u.created_at AS "createdAt", u.deleted_at AS "deletedAt",
              (SELECT max(a.created_at) FROM auths a WHERE a.user_id = u.id) AS "lastLoginAt",
              COALESCE((SELECT array_agg(DISTINCT a.type::text) FROM auths a WHERE a.user_id = u.id), '{}') AS "loginTypes",
              (SELECT count(*)::int FROM artinfo_push_tokens t WHERE t.user_id = u.id) AS "deviceCount",
              COALESCE((SELECT array_agg(DISTINCT t.platform) FROM artinfo_push_tokens t WHERE t.user_id = u.id), '{}') AS platforms,
              (SELECT min(t.created_at) FROM artinfo_push_tokens t WHERE t.user_id = u.id) AS "appInstalledAt",
              ${USER_PUSH_JOB_SQL} AS "pushJob"
         FROM users u
        WHERE ${whereSql}
        ORDER BY u.created_at DESC, u.id DESC
        LIMIT $${limitIndex} OFFSET $${offsetIndex}`,
      [...params, size, (page - 1) * size],
    );
    return { total, rows };
  }

  async findTarget(userId: number): Promise<AdminUserTarget | null> {
    const rows: AdminUserTarget[] = await this.dataSource.query(`SELECT id, type, deleted_at AS "deletedAt" FROM users WHERE id = $1`, [userId]);
    return rows[0] ?? null;
  }

  async updateType(userId: number, type: string): Promise<void> {
    await this.dataSource.query(`UPDATE users SET type = $2, updated_at = now() WHERE id = $1`, [userId, type]);
  }

  /** 탈퇴 처리 — 회원 본인 탈퇴(UserRepository.withdrawOrThrow)와 같은 익명화 + soft delete, 푸시 토큰도 지운다 */
  async withdraw(userId: number): Promise<void> {
    await this.dataSource.transaction(async manager => {
      await manager.query(
        `UPDATE users
            SET name = '탈퇴회원', nickname = '탈퇴회원',
                email = $2, phone = NULL, birth = NULL, password = NULL, icon_image_url = NULL,
                deleted_at = now(), updated_at = now()
          WHERE id = $1 AND deleted_at IS NULL`,
        [userId, `withdrawn-${userId}-${Date.now()}@withdrawn.artinfokorea.com`],
      );
      await manager.query(`DELETE FROM artinfo_push_tokens WHERE user_id = $1`, [userId]);
    });
  }

  /** 테스트·문서용 — 앱 회원 조건 SQL 조각 */
  static readonly HAS_APP_SQL = USER_HAS_APP_SQL;
}
