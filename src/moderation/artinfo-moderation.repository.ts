import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export type ReportTargetType = 'POST' | 'COMMENT' | 'USER';

export interface ReportCreator {
  reporterUserId: number;
  targetType: ReportTargetType;
  targetId: number;
  reason: string;
}

/**
 * 아트인포 커뮤니티 신고·차단 (App Store 1.2 UGC) — synchronize:false 라 기동 시 멱등 DDL 로 테이블을 보장한다.
 * 차단은 목록을 돌려주기만 하고, 글·댓글 목록이 공개 API 라 숨기는 건 앱이 한다.
 */
@Injectable()
export class ArtinfoModerationRepository implements OnModuleInit {
  private readonly logger = new Logger(ArtinfoModerationRepository.name);

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async onModuleInit(): Promise<void> {
    try {
      await this.ensureSchema();
    } catch (error) {
      this.logger.error(`신고·차단 테이블 생성 실패: ${error}`);
    }
  }

  async ensureSchema(): Promise<void> {
    await this.dataSource.query(`CREATE TABLE IF NOT EXISTS artinfo_reports (
      id               SERIAL PRIMARY KEY,
      reporter_user_id INTEGER NOT NULL,
      target_type      VARCHAR(16) NOT NULL,
      target_id        INTEGER NOT NULL,
      reason           VARCHAR(64) NOT NULL,
      status           VARCHAR(16) NOT NULL DEFAULT 'open',
      created_at       TIMESTAMP NOT NULL DEFAULT now()
    )`);
    await this.dataSource.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS uidx_artinfo_reports_reporter_target ON artinfo_reports (reporter_user_id, target_type, target_id)`,
    );
    await this.dataSource.query(`CREATE INDEX IF NOT EXISTS idx_artinfo_reports_status_created ON artinfo_reports (status, created_at DESC)`);
    await this.dataSource.query(`CREATE TABLE IF NOT EXISTS artinfo_blocks (
      id              SERIAL PRIMARY KEY,
      user_id         INTEGER NOT NULL,
      blocked_user_id INTEGER NOT NULL,
      created_at      TIMESTAMP NOT NULL DEFAULT now()
    )`);
    await this.dataSource.query(`CREATE UNIQUE INDEX IF NOT EXISTS uidx_artinfo_blocks_user_blocked ON artinfo_blocks (user_id, blocked_user_id)`);
  }

  async report(creator: ReportCreator): Promise<void> {
    await this.dataSource.query(
      `INSERT INTO artinfo_reports (reporter_user_id, target_type, target_id, reason)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (reporter_user_id, target_type, target_id) DO NOTHING`,
      [creator.reporterUserId, creator.targetType, creator.targetId, creator.reason],
    );
  }

  async block(userId: number, blockedUserId: number): Promise<void> {
    await this.dataSource.query(
      `INSERT INTO artinfo_blocks (user_id, blocked_user_id) VALUES ($1, $2)
       ON CONFLICT (user_id, blocked_user_id) DO NOTHING`,
      [userId, blockedUserId],
    );
  }

  async unblock(userId: number, blockedUserId: number): Promise<void> {
    await this.dataSource.query(`DELETE FROM artinfo_blocks WHERE user_id = $1 AND blocked_user_id = $2`, [userId, blockedUserId]);
  }

  async blockedUserIds(userId: number): Promise<number[]> {
    const rows: { blocked_user_id: number }[] = await this.dataSource.query(
      `SELECT blocked_user_id FROM artinfo_blocks WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId],
    );
    return rows.map(row => Number(row.blocked_user_id));
  }
}
