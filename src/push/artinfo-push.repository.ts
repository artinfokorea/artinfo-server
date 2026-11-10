import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

/** 사용자가 끄고 켤 수 있는 푸시 종류 — 지금은 채용 공고 하나 */
export interface ArtinfoPushPreferences {
  /** 새 채용 공고 알림 */
  job: boolean;
}

/** 가입 시 기본값 — 켜짐. 저장된 행이 없는 사용자는 이 값으로 본다 */
export const DEFAULT_PUSH_PREFERENCES: ArtinfoPushPreferences = Object.freeze({ job: true });

/**
 * 아트인포 앱 푸시 토큰(기기별 Expo Push Token)·종류별 수신 설정.
 * synchronize:false 라 기동 시 멱등 DDL 로 테이블을 보장한다 (moderation 과 같은 방식).
 */
@Injectable()
export class ArtinfoPushRepository implements OnModuleInit {
  private readonly logger = new Logger(ArtinfoPushRepository.name);

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async onModuleInit(): Promise<void> {
    try {
      await this.ensureSchema();
    } catch (error) {
      this.logger.error(`푸시 테이블 생성 실패: ${error}`);
    }
  }

  async ensureSchema(): Promise<void> {
    await this.dataSource.query(`CREATE TABLE IF NOT EXISTS artinfo_push_tokens (
      id         SERIAL PRIMARY KEY,
      user_id    INTEGER NOT NULL,
      token      VARCHAR NOT NULL,
      platform   VARCHAR(16) NOT NULL DEFAULT 'ios',
      created_at TIMESTAMP NOT NULL DEFAULT now(),
      updated_at TIMESTAMP NOT NULL DEFAULT now()
    )`);
    await this.dataSource.query(`CREATE UNIQUE INDEX IF NOT EXISTS uidx_artinfo_push_tokens_token ON artinfo_push_tokens (token)`);
    await this.dataSource.query(`CREATE INDEX IF NOT EXISTS idx_artinfo_push_tokens_user ON artinfo_push_tokens (user_id)`);
    await this.dataSource.query(`CREATE TABLE IF NOT EXISTS artinfo_push_preferences (
      user_id    INTEGER PRIMARY KEY,
      job        BOOLEAN NOT NULL DEFAULT TRUE,
      updated_at TIMESTAMP NOT NULL DEFAULT now()
    )`);
  }

  /** 토큰 기준 upsert — 같은 기기에 다른 계정으로 로그인하면 주인을 바꾼다 */
  async upsertToken(userId: number, token: string, platform: string): Promise<void> {
    await this.dataSource.query(
      `INSERT INTO artinfo_push_tokens (user_id, token, platform) VALUES ($1, $2, $3)
       ON CONFLICT (token) DO UPDATE SET user_id = EXCLUDED.user_id, platform = EXCLUDED.platform, updated_at = now()`,
      [userId, token, platform],
    );
  }

  /** 로그아웃 — 이 기기 토큰만 지운다 (다른 기기는 유지) */
  async deleteToken(token: string): Promise<void> {
    await this.dataSource.query(`DELETE FROM artinfo_push_tokens WHERE token = $1`, [token]);
  }

  /** 앱 삭제 등으로 죽은 토큰 정리 */
  async deleteTokens(tokens: string[]): Promise<void> {
    if (tokens.length === 0) return;
    await this.dataSource.query(`DELETE FROM artinfo_push_tokens WHERE token = ANY($1)`, [tokens]);
  }

  async findPreferences(userId: number): Promise<ArtinfoPushPreferences | null> {
    const rows: { job: boolean }[] = await this.dataSource.query(`SELECT job FROM artinfo_push_preferences WHERE user_id = $1`, [userId]);
    return rows.length ? { job: rows[0].job } : null;
  }

  async savePreferences(userId: number, preferences: ArtinfoPushPreferences): Promise<void> {
    await this.dataSource.query(
      `INSERT INTO artinfo_push_preferences (user_id, job) VALUES ($1, $2)
       ON CONFLICT (user_id) DO UPDATE SET job = EXCLUDED.job, updated_at = now()`,
      [userId, preferences.job],
    );
  }

  /** 채용 알림 대상 토큰 — 탈퇴하지 않은 회원 중 채용 알림을 끄지 않은 회원(저장 안 했으면 켜짐) */
  async scanJobPushTokens(): Promise<string[]> {
    const rows: { token: string }[] = await this.dataSource.query(
      `SELECT t.token
       FROM artinfo_push_tokens t
       JOIN users u ON u.id = t.user_id AND u.deleted_at IS NULL
       LEFT JOIN artinfo_push_preferences p ON p.user_id = t.user_id
       WHERE COALESCE(p.job, TRUE) = TRUE`,
    );
    return rows.map(row => row.token);
  }

  /** 테스트 발송 대상 — 관리자 계정의 기기만 (수신 설정과 무관) */
  async scanAdminTokens(): Promise<string[]> {
    const rows: { token: string }[] = await this.dataSource.query(
      `SELECT t.token
       FROM artinfo_push_tokens t
       JOIN users u ON u.id = t.user_id AND u.deleted_at IS NULL
       WHERE u.type = 'ADMIN'`,
    );
    return rows.map(row => row.token);
  }

  /**
   * 최근 N시간 안에 등록된(활성) 채용 공고 수 — 매일 12시 요약 푸시용.
   * 시각 비교는 DB 의 now() 기준으로 해서 서버·DB 타임존 차이에 흔들리지 않게 한다.
   */
  async countJobsCreatedWithinHours(hours: number): Promise<number> {
    const rows: { count: number | string }[] = await this.dataSource.query(
      `SELECT COUNT(*)::int AS count FROM jobs WHERE is_active = TRUE AND created_at >= now() - ($1 || ' hours')::interval`,
      [String(hours)],
    );
    return Number(rows[0]?.count ?? 0);
  }
}
