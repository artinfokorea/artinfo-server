import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { APP_PLATFORMS, AppPlatform } from '@/app-version/app-version.domain';

export interface AppVersionRow {
  platform: AppPlatform;
  minVersion: string;
  latestVersion: string | null;
  message: string | null;
  updatedBy: number | null;
  updatedAt: Date;
}

export interface AppVersionInput {
  minVersion: string;
  latestVersion: string | null;
  message: string | null;
}

/** 처음 설치 시 넣는 기본값 — 출시 버전(1.0)이면 업데이트를 요구하지 않는다 */
export const DEFAULT_MIN_VERSION = '1.0';

const SELECT_COLUMNS = `platform, min_version AS "minVersion", latest_version AS "latestVersion", message, updated_by AS "updatedBy", updated_at AS "updatedAt"`;

/**
 * 플랫폼별 앱 최소 버전(강제 업데이트)·최신 버전(선택 안내)·안내 문구.
 * synchronize:false 라 기동 시 멱등 DDL 로 테이블과 기본 행을 보장한다 (push 와 같은 방식).
 */
@Injectable()
export class AppVersionRepository implements OnModuleInit {
  private readonly logger = new Logger(AppVersionRepository.name);

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async onModuleInit(): Promise<void> {
    try {
      await this.ensureSchema();
    } catch (error) {
      this.logger.error(`앱 버전 테이블 생성 실패: ${error}`);
    }
  }

  async ensureSchema(): Promise<void> {
    await this.dataSource.query(`CREATE TABLE IF NOT EXISTS artinfo_app_versions (
      platform       VARCHAR(16) PRIMARY KEY,
      min_version    VARCHAR(32) NOT NULL DEFAULT '${DEFAULT_MIN_VERSION}',
      latest_version VARCHAR(32),
      message        VARCHAR(500),
      updated_by     INTEGER,
      updated_at     TIMESTAMP NOT NULL DEFAULT now()
    )`);
    for (const platform of APP_PLATFORMS) {
      await this.dataSource.query(`INSERT INTO artinfo_app_versions (platform) VALUES ($1) ON CONFLICT (platform) DO NOTHING`, [platform]);
    }
  }

  async findAll(): Promise<AppVersionRow[]> {
    return this.dataSource.query(`SELECT ${SELECT_COLUMNS} FROM artinfo_app_versions ORDER BY platform`);
  }

  async findByPlatform(platform: AppPlatform): Promise<AppVersionRow | null> {
    const rows: AppVersionRow[] = await this.dataSource.query(`SELECT ${SELECT_COLUMNS} FROM artinfo_app_versions WHERE platform = $1`, [platform]);
    return rows[0] ?? null;
  }

  /** 행이 없어도 만든다 (기본 행이 지워졌을 때 대비) */
  async save(platform: AppPlatform, input: AppVersionInput, updatedBy: number): Promise<void> {
    await this.dataSource.query(
      `INSERT INTO artinfo_app_versions (platform, min_version, latest_version, message, updated_by, updated_at)
       VALUES ($1, $2, $3, $4, $5, now())
       ON CONFLICT (platform) DO UPDATE
         SET min_version = EXCLUDED.min_version, latest_version = EXCLUDED.latest_version,
             message = EXCLUDED.message, updated_by = EXCLUDED.updated_by, updated_at = now()`,
      [platform, input.minVersion, input.latestVersion, input.message, updatedBy],
    );
  }
}
