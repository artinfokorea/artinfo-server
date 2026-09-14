import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { buildAppConfig, OngiAppConfig, OngiAppPlatform } from '@/ongi/config/domain/service/ongi-app-config';

const CACHE_MS = 60_000;

/**
 * 앱 최소/최신 버전 — ongi_configs 키-값 테이블에서 플랫폼별로 읽는다.
 * 강제 업데이트가 필요할 때 운영 DB 에서:
 *   UPDATE ongi_configs SET value = '1.0.6' WHERE key = 'min_ios_version';
 *   UPDATE ongi_configs SET value = '1.0.3' WHERE key = 'min_android_version';
 */
@Injectable()
export class OngiGetAppConfigUseCase {
  private cached: { rows: Map<string, string>; at: number } | null = null;

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async execute(platform: OngiAppPlatform): Promise<OngiAppConfig> {
    if (!this.cached || Date.now() - this.cached.at >= CACHE_MS) {
      const rows: { key: string; value: string }[] = await this.dataSource.query(
        `SELECT key, value FROM ongi_configs WHERE key IN ('min_ios_version', 'latest_ios_version', 'min_android_version', 'latest_android_version')`,
      );
      this.cached = { rows: new Map(rows.map(row => [row.key, row.value])), at: Date.now() };
    }

    return buildAppConfig(platform, this.cached.rows);
  }

  /** 관리자 화면에서 버전을 바꾸면 이 인스턴스의 캐시를 비운다 (다른 인스턴스는 최대 1분 뒤 반영) */
  invalidate(): void {
    this.cached = null;
  }
}
