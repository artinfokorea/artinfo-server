import { ForbiddenException, Inject, Injectable, Logger } from '@nestjs/common';
import { AppPlatform, isAppPlatform, isUpdateAvailable, isUpdateRequired, isValidVersion } from '@/app-version/app-version.domain';
import { AppPlatformInvalid, AppVersionInvalid, AppVersionNotConfigured } from '@/app-version/app-version.exception';
import { ONCHURCH_USER_REPOSITORY, IOnchurchUserRepository } from '@/onchurch/user/domain/repository/onchurch-user.repository.interface';
import { ONCHURCH_USER_ROLE } from '@/onchurch/user/domain/entity/onchurch-user.entity';
import { OnchurchAppVersionRepository } from '@/onchurch/app-version/onchurch-app-version.repository';
import { OnchurchAppStoreUrlInvalid } from '@/onchurch/app-version/onchurch-app-version.exception';
import {
  OnchurchAppVersionCheckResponse,
  OnchurchMasterAppVersionsResponse,
  OnchurchSaveAppVersionRequest,
} from '@/onchurch/app-version/onchurch-app-version.dto';

/** 온교회 앱 버전 — 버전 문자열 규칙·비교는 아트인포 앱과 같은 것(app-version.domain)을 쓴다 */
@Injectable()
export class OnchurchAppVersionService {
  private readonly logger = new Logger(OnchurchAppVersionService.name);

  constructor(
    private readonly repository: OnchurchAppVersionRepository,
    @Inject(ONCHURCH_USER_REPOSITORY) private readonly userRepository: IOnchurchUserRepository,
  ) {}

  /** 앱 기동 시 — platform 필수, version 은 선택(보내면 서버가 판정해 준다) */
  async check(platform: string | undefined, version: string | undefined): Promise<OnchurchAppVersionCheckResponse> {
    if (!isAppPlatform(platform)) throw new AppPlatformInvalid();
    const current = version?.trim() || undefined;
    if (current !== undefined && !isValidVersion(current)) throw new AppVersionInvalid();

    const row = await this.repository.findByPlatform(platform);
    if (!row) throw new AppVersionNotConfigured();

    return new OnchurchAppVersionCheckResponse(row, {
      updateRequired: current === undefined ? null : isUpdateRequired(current, row.minVersion),
      updateAvailable: current === undefined || !row.latestVersion ? null : isUpdateAvailable(current, row.latestVersion),
    });
  }

  async listForMaster(userId: number): Promise<OnchurchMasterAppVersionsResponse> {
    await this.assertMaster(userId);
    return new OnchurchMasterAppVersionsResponse(await this.repository.findAll());
  }

  async save(userId: number, platform: string, request: OnchurchSaveAppVersionRequest): Promise<OnchurchMasterAppVersionsResponse> {
    await this.assertMaster(userId);
    if (!isAppPlatform(platform)) throw new AppPlatformInvalid();
    const minVersion = request.minVersion.trim();
    const latestVersion = request.latestVersion?.trim() || null;
    const message = request.message?.trim() || null;
    const storeUrl = request.storeUrl?.trim() || null;
    if (!isValidVersion(minVersion) || (latestVersion !== null && !isValidVersion(latestVersion))) throw new AppVersionInvalid();
    // 앱이 그대로 여는 주소라 https 만 받는다.
    if (storeUrl !== null && !/^https:\/\/\S+$/.test(storeUrl)) throw new OnchurchAppStoreUrlInvalid();

    await this.repository.save(platform as AppPlatform, { minVersion, latestVersion, message, storeUrl }, userId);
    this.logger.log(`온교회 앱 버전 저장 ${platform}: min ${minVersion}, latest ${latestVersion ?? '-'} (마스터 ${userId})`);
    return new OnchurchMasterAppVersionsResponse(await this.repository.findAll());
  }

  private async assertMaster(userId: number): Promise<void> {
    const user = await this.userRepository.findOneOrThrowById(userId);
    if (user.role !== ONCHURCH_USER_ROLE.MASTER) throw new ForbiddenException('마스터 권한이 필요합니다.');
  }
}
