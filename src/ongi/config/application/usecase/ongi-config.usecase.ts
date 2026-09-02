import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export interface OngiAppConfig {
  minIosVersion: string;
  latestIosVersion: string;
  storeUrl: string;
}

const STORE_URL = 'https://apps.apple.com/app/id6805759281';
const CACHE_MS = 60_000;

/**
 * 앱 최소/최신 버전 — ongi_configs 키-값 테이블에서 읽는다.
 * 강제 업데이트가 필요할 때 운영 DB 에서:
 *   UPDATE ongi_configs SET value = '1.0.2' WHERE key = 'min_ios_version';
 */
@Injectable()
export class OngiGetAppConfigUseCase {
  private cached: { value: OngiAppConfig; at: number } | null = null;

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async execute(): Promise<OngiAppConfig> {
    if (this.cached && Date.now() - this.cached.at < CACHE_MS) return this.cached.value;

    const rows: { key: string; value: string }[] = await this.dataSource.query(
      `SELECT key, value FROM ongi_configs WHERE key IN ('min_ios_version', 'latest_ios_version')`,
    );
    const byKey = new Map(rows.map(row => [row.key, row.value]));
    const value: OngiAppConfig = {
      minIosVersion: byKey.get('min_ios_version') ?? '1.0.0',
      latestIosVersion: byKey.get('latest_ios_version') ?? '1.0.0',
      storeUrl: STORE_URL,
    };
    this.cached = { value, at: Date.now() };

    return value;
  }
}
