import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

/**
 * 온교회 앱 푸시 토큰(기기별 Expo Push Token)과 알림 수신 설정(켜기/끄기 하나).
 * synchronize:false 라 기동 시 멱등 DDL 로 테이블을 보장한다 (아트인포 푸시·교제 차단과 같은 방식).
 */
@Injectable()
export class OnchurchPushRepository implements OnModuleInit {
  private readonly logger = new Logger(OnchurchPushRepository.name);

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async onModuleInit(): Promise<void> {
    try {
      await this.ensureSchema();
    } catch (error) {
      this.logger.error(`온교회 푸시 테이블 생성 실패: ${error}`);
    }
  }

  async ensureSchema(): Promise<void> {
    await this.dataSource.query(`CREATE TABLE IF NOT EXISTS onchurch_push_tokens (
      id         SERIAL PRIMARY KEY,
      user_id    INTEGER NOT NULL,
      token      VARCHAR NOT NULL,
      platform   VARCHAR(16) NOT NULL DEFAULT 'ios',
      created_at TIMESTAMP NOT NULL DEFAULT now(),
      updated_at TIMESTAMP NOT NULL DEFAULT now()
    )`);
    await this.dataSource.query(`CREATE UNIQUE INDEX IF NOT EXISTS uidx_onchurch_push_tokens_token ON onchurch_push_tokens (token)`);
    await this.dataSource.query(`CREATE INDEX IF NOT EXISTS idx_onchurch_push_tokens_user ON onchurch_push_tokens (user_id)`);
    await this.dataSource.query(`CREATE TABLE IF NOT EXISTS onchurch_push_preferences (
      user_id    INTEGER PRIMARY KEY,
      enabled    BOOLEAN NOT NULL DEFAULT TRUE,
      updated_at TIMESTAMP NOT NULL DEFAULT now()
    )`);
  }

  /** 토큰 기준 upsert — 같은 기기에 다른 계정으로 로그인하면 주인을 바꾼다 */
  async upsertToken(userId: number, token: string, platform: string): Promise<void> {
    await this.dataSource.query(
      `INSERT INTO onchurch_push_tokens (user_id, token, platform) VALUES ($1, $2, $3)
       ON CONFLICT (token) DO UPDATE SET user_id = EXCLUDED.user_id, platform = EXCLUDED.platform, updated_at = now()`,
      [userId, token, platform],
    );
  }

  /** 로그아웃 — 이 기기 토큰만 지운다 */
  async deleteToken(token: string): Promise<void> {
    await this.dataSource.query(`DELETE FROM onchurch_push_tokens WHERE token = $1`, [token]);
  }

  /** 앱 삭제 등으로 죽은 토큰 정리 */
  async deleteTokens(tokens: string[]): Promise<void> {
    if (tokens.length === 0) return;
    await this.dataSource.query(`DELETE FROM onchurch_push_tokens WHERE token = ANY($1)`, [tokens]);
  }

  /** 저장 전이면 켜짐 */
  async isEnabled(userId: number): Promise<boolean> {
    const rows: { enabled: boolean }[] = await this.dataSource.query(`SELECT enabled FROM onchurch_push_preferences WHERE user_id = $1`, [userId]);
    return rows.length ? rows[0].enabled : true;
  }

  async setEnabled(userId: number, enabled: boolean): Promise<void> {
    await this.dataSource.query(
      `INSERT INTO onchurch_push_preferences (user_id, enabled) VALUES ($1, $2)
       ON CONFLICT (user_id) DO UPDATE SET enabled = EXCLUDED.enabled, updated_at = now()`,
      [userId, enabled],
    );
  }

  async findChurchName(churchId: number): Promise<string | null> {
    const rows: { name: string }[] = await this.dataSource.query(`SELECT name FROM onchurch_churches WHERE id = $1 AND deleted_at IS NULL`, [churchId]);
    return rows[0]?.name ?? null;
  }

  /**
   * 교회 사람들의 기기 — 소속 성도(church_id)와 교회 소유자. 작성자 본인, 알림을 끈 사람,
   * 작성자를 차단한 사람은 뺀다.
   */
  async scanChurchTokens(churchId: number, excludeUserId: number): Promise<string[]> {
    const rows: { token: string }[] = await this.dataSource.query(
      `SELECT t.token
       FROM onchurch_push_tokens t
       JOIN onchurch_users u ON u.id = t.user_id AND u.deleted_at IS NULL
       LEFT JOIN onchurch_push_preferences p ON p.user_id = t.user_id
       WHERE (u.church_id = $1 OR u.id = (SELECT owner_id FROM onchurch_churches WHERE id = $1))
         AND u.id <> $2
         AND COALESCE(p.enabled, TRUE) = TRUE
         AND NOT EXISTS (SELECT 1 FROM onchurch_community_blocks b WHERE b.user_id = u.id AND b.blocked_user_id = $2)`,
      [churchId, excludeUserId],
    );
    return rows.map(row => row.token);
  }

  /** 한 사람의 기기 — 알림을 껐거나 보낸 사람(fromUserId)을 차단했으면 빈 목록 */
  async scanUserTokens(userId: number, fromUserId: number): Promise<string[]> {
    const rows: { token: string }[] = await this.dataSource.query(
      `SELECT t.token
       FROM onchurch_push_tokens t
       JOIN onchurch_users u ON u.id = t.user_id AND u.deleted_at IS NULL
       LEFT JOIN onchurch_push_preferences p ON p.user_id = t.user_id
       WHERE t.user_id = $1
         AND COALESCE(p.enabled, TRUE) = TRUE
         AND NOT EXISTS (SELECT 1 FROM onchurch_community_blocks b WHERE b.user_id = $1 AND b.blocked_user_id = $2)`,
      [userId, fromUserId],
    );
    return rows.map(row => row.token);
  }
}
