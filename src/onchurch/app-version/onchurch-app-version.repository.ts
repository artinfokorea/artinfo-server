import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { APP_PLATFORMS, AppPlatform } from '@/app-version/app-version.domain';

export interface OnchurchAppVersionRow {
  platform: AppPlatform;
  minVersion: string;
  latestVersion: string | null;
  message: string | null;
  storeUrl: string | null;
  updatedBy: number | null;
  updatedAt: Date;
}

export interface OnchurchAppVersionInput {
  minVersion: string;
  latestVersion: string | null;
  message: string | null;
  storeUrl: string | null;
}

/** 처음 설치 시 넣는 기본값 — 출시 버전(1.0)이면 업데이트를 요구하지 않는다 */
export const ONCHURCH_DEFAULT_MIN_VERSION = '1.0';

const SELECT_COLUMNS = `platform, min_version AS "minVersion", latest_version AS "latestVersion", message, store_url AS "storeUrl", updated_by AS "updatedBy", updated_at AS "updatedAt"`;

/**
 * 온교회 앱의 플랫폼별 최소 버전(강제 업데이트)·최신 버전(선택 안내)·안내 문구·스토어 주소.
 * 아트인포 앱(artinfo_app_versions)과 같은 방식 — synchronize:false 라 기동 시 멱등 DDL 로 테이블과 기본 행을 보장한다.
 */
@Injectable()
export class OnchurchAppVersionRepository implements OnModuleInit {
  private readonly logger = new Logger(OnchurchAppVersionRepository.name);

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async onModuleInit(): Promise<void> {
    try {
      await this.ensureSchema();
    } catch (error) {
      this.logger.error(`온교회 앱 버전 테이블 생성 실패: ${error}`);
    }
  }

  async ensureSchema(): Promise<void> {
    await this.dataSource.query(`CREATE TABLE IF NOT EXISTS onchurch_app_versions (
      platform       VARCHAR(16) PRIMARY KEY,
      min_version    VARCHAR(32) NOT NULL DEFAULT '${ONCHURCH_DEFAULT_MIN_VERSION}',
      latest_version VARCHAR(32),
      message        VARCHAR(500),
      store_url      VARCHAR(500),
      updated_by     INTEGER,
      updated_at     TIMESTAMP NOT NULL DEFAULT now()
    )`);
    for (const platform of APP_PLATFORMS) {
      await this.dataSource.query(`INSERT INTO onchurch_app_versions (platform) VALUES ($1) ON CONFLICT (platform) DO NOTHING`, [platform]);
    }
  }

  async findAll(): Promise<OnchurchAppVersionRow[]> {
    return this.dataSource.query(`SELECT ${SELECT_COLUMNS} FROM onchurch_app_versions ORDER BY platform`);
  }

  async findByPlatform(platform: AppPlatform): Promise<OnchurchAppVersionRow | null> {
    const rows: OnchurchAppVersionRow[] = await this.dataSource.query(`SELECT ${SELECT_COLUMNS} FROM onchurch_app_versions WHERE platform = $1`, [platform]);
    return rows[0] ?? null;
  }

  /** 행이 없어도 만든다 (기본 행이 지워졌을 때 대비) */
  async save(platform: AppPlatform, input: OnchurchAppVersionInput, updatedBy: number): Promise<void> {
    await this.dataSource.query(
      `INSERT INTO onchurch_app_versions (platform, min_version, latest_version, message, store_url, updated_by, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, now())
       ON CONFLICT (platform) DO UPDATE
         SET min_version = EXCLUDED.min_version, latest_version = EXCLUDED.latest_version,
             message = EXCLUDED.message, store_url = EXCLUDED.store_url, updated_by = EXCLUDED.updated_by, updated_at = now()`,
      [platform, input.minVersion, input.latestVersion, input.message, input.storeUrl, updatedBy],
    );
  }
}
