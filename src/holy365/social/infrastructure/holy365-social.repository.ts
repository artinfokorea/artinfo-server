import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { churchKey, normalizeRegion } from '@/holy365/social/domain/holy365-church-name';

export interface Holy365Church {
  id: number;
  name: string;
  region: string;
  address: string | null;
  kakaoPlaceId: string | null;
  memberCount: number;
}

export interface Holy365UserCard {
  id: number;
  name: string;
  iconImageUrl: string | null;
  churchId: number | null;
  churchName: string | null;
  /** 최근 7일 필사 절 수 */
  weekVerses: number;
  lastActiveDay: string | null;
}

export interface Holy365FollowActivity extends Holy365UserCard {
  todayVerses: number;
  lastVersionCode: string | null;
  lastBook: number | null;
  lastChapter: number | null;
  lastAt: Date | null;
}

const CHURCH_COLUMNS = `c.id, c.name, c.region, c.address, c.kakao_place_id AS "kakaoPlaceId",
  (SELECT COUNT(*)::int FROM holy365_users m WHERE m.church_id = c.id AND m.deleted_at IS NULL) AS "memberCount"`;

/** 사용자 카드 — 이름 · 교회 · 최근 7일 필사량 · 마지막 필사일 */
const CARD_COLUMNS = `u.id, u.name, u.icon_image_url AS "iconImageUrl", u.church_id AS "churchId", ch.name AS "churchName",
  COALESCE((SELECT SUM(a.verses) FROM holy365_daily_activity a WHERE a.user_id = u.id AND a.day >= (now() AT TIME ZONE 'Asia/Seoul')::date - 6), 0)::int AS "weekVerses",
  (SELECT to_char(MAX(a.day), 'YYYY-MM-DD') FROM holy365_daily_activity a WHERE a.user_id = u.id) AS "lastActiveDay"`;

const REAL_USER = `u.deleted_at IS NULL AND u.sns_type <> 'dev'`;

@Injectable()
export class Holy365SocialRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  // ── 교회 ─────────────────────────────────────────────

  async findChurch(id: number): Promise<Holy365Church | null> {
    const rows = await this.dataSource.query(`SELECT ${CHURCH_COLUMNS} FROM holy365_churches c WHERE c.id = $1`, [id]);
    return rows[0] ?? null;
  }

  async searchChurches(query: string, limit: number): Promise<Holy365Church[]> {
    const like = `%${query.replace(/[%_\\]/g, '\\$&').replace(/\s+/g, '%')}%`;
    return this.dataSource.query(
      `SELECT ${CHURCH_COLUMNS} FROM holy365_churches c
        WHERE replace(c.name, ' ', '') ILIKE replace($1, ' ', '') OR c.region ILIKE $1
        ORDER BY "memberCount" DESC, c.id LIMIT $2`,
      [like, limit],
    );
  }

  async churchesByPlaceIds(placeIds: string[]): Promise<Holy365Church[]> {
    if (!placeIds.length) return [];
    return this.dataSource.query(`SELECT ${CHURCH_COLUMNS} FROM holy365_churches c WHERE c.kakao_place_id = ANY($1)`, [placeIds]);
  }

  /** 카카오 장소로 교회 찾기·만들기 — 같은 place_id 면 그 교회. 직접 등록된 같은 이름·지역 교회가 있으면 그 교회에 place_id 를 붙인다 */
  async upsertKakaoChurch(place: { placeId: string; name: string; address: string; region: string }, userId: number): Promise<number> {
    const existing = await this.dataSource.query(`SELECT id FROM holy365_churches WHERE kakao_place_id = $1`, [place.placeId]);
    if (existing[0]) return existing[0].id;

    const key = churchKey(place.name, place.region);
    const manual = await this.dataSource.query(`SELECT id FROM holy365_churches WHERE church_key = $1 AND kakao_place_id IS NULL ORDER BY id LIMIT 1`, [key]);
    if (manual[0]) {
      await this.dataSource.query(`UPDATE holy365_churches SET kakao_place_id = $2, address = $3, name = $4 WHERE id = $1`, [
        manual[0].id,
        place.placeId,
        place.address,
        place.name,
      ]);
      return manual[0].id;
    }

    const rows = await this.dataSource.query(
      `INSERT INTO holy365_churches (name, region, address, church_key, kakao_place_id, created_by) VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (kakao_place_id) WHERE kakao_place_id IS NOT NULL DO UPDATE SET name = EXCLUDED.name RETURNING id`,
      [place.name, place.region, place.address, key, place.placeId, userId],
    );
    return rows[0].id;
  }

  /** 직접 등록 — 이름 + 지역을 정리한 키가 같은 교회(카카오 교회 포함)가 있으면 그 교회 */
  async upsertManualChurch(name: string, region: string, userId: number): Promise<number> {
    const key = churchKey(name, region);
    const existing = await this.dataSource.query(`SELECT id FROM holy365_churches WHERE church_key = $1 ORDER BY (kakao_place_id IS NULL), id LIMIT 1`, [key]);
    if (existing[0]) return existing[0].id;

    const rows = await this.dataSource.query(`INSERT INTO holy365_churches (name, region, church_key, created_by) VALUES ($1, $2, $3, $4) RETURNING id`, [
      name.trim(),
      normalizeRegion(region) || region.trim(),
      key,
      userId,
    ]);
    return rows[0].id;
  }

  /** 교회 교인 — 이번 달 필사 절 수 순 */
  churchMembers(churchId: number, monthStart: string, limit: number): Promise<(Holy365UserCard & { monthVerses: number })[]> {
    return this.dataSource.query(
      `SELECT ${CARD_COLUMNS},
              COALESCE((SELECT SUM(a.verses) FROM holy365_daily_activity a WHERE a.user_id = u.id AND a.day >= $2::date), 0)::int AS "monthVerses"
         FROM holy365_users u LEFT JOIN holy365_churches ch ON ch.id = u.church_id
        WHERE u.church_id = $1 AND ${REAL_USER}
        ORDER BY "monthVerses" DESC, u.id LIMIT $3`,
      [churchId, monthStart, limit],
    );
  }

  // ── 팔로우 ─────────────────────────────────────────────

  async follow(followerId: number, followingId: number): Promise<void> {
    await this.dataSource.query(`INSERT INTO holy365_follows (follower_id, following_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [followerId, followingId]);
  }

  async unfollow(followerId: number, followingId: number): Promise<void> {
    await this.dataSource.query(`DELETE FROM holy365_follows WHERE follower_id = $1 AND following_id = $2`, [followerId, followingId]);
  }

  async followCounts(userId: number, viewerId: number | null): Promise<{ followers: number; following: number; isFollowing: boolean; followsMe: boolean }> {
    const rows = await this.dataSource.query(
      `SELECT (SELECT COUNT(*)::int FROM holy365_follows f JOIN holy365_users u ON u.id = f.follower_id WHERE f.following_id = $1 AND u.deleted_at IS NULL) AS followers,
              (SELECT COUNT(*)::int FROM holy365_follows f JOIN holy365_users u ON u.id = f.following_id WHERE f.follower_id = $1 AND u.deleted_at IS NULL) AS following,
              EXISTS (SELECT 1 FROM holy365_follows WHERE follower_id = $2 AND following_id = $1) AS "isFollowing",
              EXISTS (SELECT 1 FROM holy365_follows WHERE follower_id = $1 AND following_id = $2) AS "followsMe"`,
      [userId, viewerId ?? 0],
    );
    return rows[0];
  }

  followList(userId: number, direction: 'followers' | 'following', limit: number): Promise<Holy365UserCard[]> {
    const [match, show] = direction === 'followers' ? ['following_id', 'follower_id'] : ['follower_id', 'following_id'];
    return this.dataSource.query(
      `SELECT ${CARD_COLUMNS} FROM holy365_follows f
         JOIN holy365_users u ON u.id = f.${show} LEFT JOIN holy365_churches ch ON ch.id = u.church_id
        WHERE f.${match} = $1 AND ${REAL_USER}
        ORDER BY f.created_at DESC LIMIT $2`,
      [userId, limit],
    );
  }

  /** 내가 팔로우한 사람들의 최근 필사 — 최근에 쓴 순 */
  followingActivity(userId: number, today: string, limit: number): Promise<Holy365FollowActivity[]> {
    return this.dataSource.query(
      `SELECT ${CARD_COLUMNS},
              COALESCE((SELECT a.verses FROM holy365_daily_activity a WHERE a.user_id = u.id AND a.day = $2::date), 0)::int AS "todayVerses",
              lv.version_code AS "lastVersionCode", lv.last_book::int AS "lastBook", lv.last_chapter::int AS "lastChapter", lv.updated_at AS "lastAt"
         FROM holy365_follows f
         JOIN holy365_users u ON u.id = f.following_id
         LEFT JOIN holy365_churches ch ON ch.id = u.church_id
         LEFT JOIN LATERAL (SELECT * FROM holy365_user_versions v WHERE v.user_id = u.id ORDER BY v.updated_at DESC LIMIT 1) lv ON true
        WHERE f.follower_id = $1 AND ${REAL_USER}
        ORDER BY lv.updated_at DESC NULLS LAST, u.id LIMIT $3`,
      [userId, today, limit],
    );
  }

  /**
   * 팔로우 추천 — ① 같은 교회 ② 나를 팔로우하는데 내가 안 한 사람(맞팔) ③ 이번 주 열심히 쓰는 사람.
   * 나 자신·이미 팔로우한 사람·비공개 프로필은 뺀다.
   */
  recommendations(userId: number, churchId: number | null, limit: number): Promise<(Holy365UserCard & { reason: 'church' | 'followsYou' | 'active' })[]> {
    return this.dataSource.query(
      `WITH candidates AS (
         SELECT u.id,
                CASE WHEN $2::int IS NOT NULL AND u.church_id = $2 THEN 1
                     WHEN EXISTS (SELECT 1 FROM holy365_follows x WHERE x.follower_id = u.id AND x.following_id = $1) THEN 2
                     ELSE 3 END AS priority
           FROM holy365_users u
          WHERE ${REAL_USER} AND u.profile_public AND u.id <> $1
            AND NOT EXISTS (SELECT 1 FROM holy365_follows f WHERE f.follower_id = $1 AND f.following_id = u.id)
       )
       SELECT ${CARD_COLUMNS},
              CASE c.priority WHEN 1 THEN 'church' WHEN 2 THEN 'followsYou' ELSE 'active' END AS reason
         FROM candidates c
         JOIN holy365_users u ON u.id = c.id LEFT JOIN holy365_churches ch ON ch.id = u.church_id
        WHERE c.priority < 3 OR EXISTS (SELECT 1 FROM holy365_daily_activity a WHERE a.user_id = u.id AND a.day >= (now() AT TIME ZONE 'Asia/Seoul')::date - 6)
        ORDER BY c.priority, "weekVerses" DESC, u.id
        LIMIT $3`,
      [userId, churchId, limit],
    );
  }

  /** 이름으로 사람 찾기 (공개 프로필만) */
  searchUsers(query: string, limit: number): Promise<Holy365UserCard[]> {
    const like = `%${query.replace(/[%_\\]/g, '\\$&')}%`;
    return this.dataSource.query(
      `SELECT ${CARD_COLUMNS} FROM holy365_users u LEFT JOIN holy365_churches ch ON ch.id = u.church_id
        WHERE ${REAL_USER} AND u.name ILIKE $1 ORDER BY "weekVerses" DESC, u.id LIMIT $2`,
      [like, limit],
    );
  }
}
