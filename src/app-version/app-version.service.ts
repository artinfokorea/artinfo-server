import { Injectable, Logger } from '@nestjs/common';
import { AppVersionRepository } from '@/app-version/app-version.repository';
import { AppPlatform, isAppPlatform, isUpdateAvailable, isUpdateRequired, isValidVersion } from '@/app-version/app-version.domain';
import { AppPlatformInvalid, AppVersionInvalid, AppVersionNotConfigured } from '@/app-version/app-version.exception';
import { AdminAppVersionsResponse, AppVersionCheckResponse } from '@/app-version/dto/app-version.response';
import { SaveAppVersionRequest } from '@/app-version/dto/app-version.request';

@Injectable()
export class AppVersionService {
  private readonly logger = new Logger(AppVersionService.name);

  constructor(private readonly repository: AppVersionRepository) {}

  /** 앱 기동 시 — platform 필수, version 은 선택(보내면 서버가 판정해 준다) */
  async check(platform: string | undefined, version: string | undefined): Promise<AppVersionCheckResponse> {
    if (!isAppPlatform(platform)) throw new AppPlatformInvalid();
    const current = version?.trim() || undefined;
    if (current !== undefined && !isValidVersion(current)) throw new AppVersionInvalid();

    const row = await this.repository.findByPlatform(platform);
    if (!row) throw new AppVersionNotConfigured();

    return new AppVersionCheckResponse(row, {
      updateRequired: current === undefined ? null : isUpdateRequired(current, row.minVersion),
      updateAvailable: current === undefined || !row.latestVersion ? null : isUpdateAvailable(current, row.latestVersion),
    });
  }

  async listForAdmin(): Promise<AdminAppVersionsResponse> {
    return new AdminAppVersionsResponse(await this.repository.findAll());
  }

  async save(platform: string, request: SaveAppVersionRequest, adminId: number): Promise<AdminAppVersionsResponse> {
    if (!isAppPlatform(platform)) throw new AppPlatformInvalid();
    const minVersion = request.minVersion.trim();
    const latestVersion = request.latestVersion?.trim() || null;
    const message = request.message?.trim() || null;
    if (!isValidVersion(minVersion) || (latestVersion !== null && !isValidVersion(latestVersion))) throw new AppVersionInvalid();

    await this.repository.save(platform as AppPlatform, { minVersion, latestVersion, message }, adminId);
    this.logger.log(`앱 최소 버전 저장 ${platform}: min ${minVersion}, latest ${latestVersion ?? '-'} (관리자 ${adminId})`);
    return this.listForAdmin();
  }
}
