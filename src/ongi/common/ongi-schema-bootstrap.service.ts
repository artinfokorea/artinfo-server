import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

/**
 * 출시 준비 중 추가된 테이블을 기동 시 멱등하게 생성한다 (CREATE ... IF NOT EXISTS).
 *
 * 온기 DDL 은 원칙적으로 운영 DB 에 수동 적용하지만, 신고·차단 테이블은 피드 조회 경로에서
 * 매 요청마다 읽히므로 배포와 DDL 적용 순서가 어긋나면 피드 전체가 500 이 난다. 그 사고를 막기 위한 안전장치.
 * 원본 DDL: group/ongi-groups.ddl.sql (ongi_blocks), report/ongi-reports.ddl.sql (ongi_reports)
 */
@Injectable()
export class OngiSchemaBootstrapService implements OnModuleInit {
  private readonly logger = new Logger(OngiSchemaBootstrapService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit(): Promise<void> {
    const statements = [
      `CREATE TABLE IF NOT EXISTS ongi_blocks (
        id              SERIAL PRIMARY KEY,
        user_id         INTEGER NOT NULL,
        blocked_user_id INTEGER NOT NULL,
        created_at      TIMESTAMP NOT NULL DEFAULT now()
      )`,
      `CREATE UNIQUE INDEX IF NOT EXISTS uidx_ongi_blocks_user_blocked ON ongi_blocks (user_id, blocked_user_id)`,
      `CREATE TABLE IF NOT EXISTS ongi_reports (
        id               SERIAL PRIMARY KEY,
        reporter_user_id INTEGER NOT NULL,
        target_type      VARCHAR(16) NOT NULL,
        target_id        INTEGER NOT NULL,
        reason           VARCHAR NOT NULL,
        status           VARCHAR(16) NOT NULL DEFAULT 'open',
        created_at       TIMESTAMP NOT NULL DEFAULT now(),
        updated_at       TIMESTAMP NOT NULL DEFAULT now()
      )`,
      `CREATE INDEX IF NOT EXISTS idx_ongi_reports_status_created ON ongi_reports (status, created_at DESC)`,
    ];

    try {
      for (const statement of statements) {
        await this.dataSource.query(statement);
      }
    } catch (error) {
      // 권한 부족 등으로 실패해도 서버 기동은 막지 않는다 — 수동 DDL 적용으로 복구 가능
      this.logger.error(`ongi schema bootstrap failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
