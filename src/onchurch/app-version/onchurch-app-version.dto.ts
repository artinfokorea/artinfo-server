import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { AppPlatform, VERSION_PATTERN } from '@/app-version/app-version.domain';
import { OnchurchAppVersionRow } from '@/onchurch/app-version/onchurch-app-version.repository';

const VERSION_MESSAGE = '버전은 숫자와 점으로 1~4마디여야 합니다 (예: 1.2.0)';

/** 온교회 앱 Android 패키지명 — 스토어 주소를 따로 등록하지 않았을 때 Play 주소를 만든다 */
export const ONCHURCH_ANDROID_PACKAGE = 'kr.co.everychurch.app';

/** 마스터가 등록한 주소가 우선. 없으면 Android 는 패키지명으로 만들고, iOS 는 App Store 앱 ID 를 알 수 없어 null */
export function resolveOnchurchStoreUrl(platform: AppPlatform, storeUrl: string | null): string | null {
  if (storeUrl) return storeUrl;
  return platform === 'android' ? `https://play.google.com/store/apps/details?id=${ONCHURCH_ANDROID_PACKAGE}` : null;
}

/** 마스터 — 플랫폼별 최소/최신 버전·안내 문구·스토어 주소 저장. 빈 문자열은 null 로 본다 */
export class OnchurchSaveAppVersionRequest {
  @IsString()
  @Matches(VERSION_PATTERN, { message: VERSION_MESSAGE })
  @ApiProperty({ type: String, required: true, description: '이보다 낮은 앱은 강제 업데이트', example: '1.1' })
  minVersion: string;

  @IsOptional()
  @IsString()
  @Matches(VERSION_PATTERN, { message: VERSION_MESSAGE })
  @ApiProperty({ type: String, required: false, nullable: true, description: '스토어 최신 버전 — 이보다 낮으면 선택 업데이트 안내', example: '1.2' })
  latestVersion?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @ApiProperty({ type: String, required: false, nullable: true, description: '업데이트 안내 문구 (비우면 기본 문구)' })
  message?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @ApiProperty({ type: String, required: false, nullable: true, description: '업데이트 받을 스토어 주소 (https://). 비우면 Android 는 기본 Play 주소' })
  storeUrl?: string | null;
}

/** 앱이 기동 시 받는 응답 — 전역 ResponseInterceptor 가 { code, message, item } 으로 감싼다 */
export class OnchurchAppVersionCheckResponse {
  @ApiProperty({ type: String, description: 'ios / android' }) platform: string;
  @ApiProperty({ type: String, description: '이보다 낮으면 강제 업데이트' }) minVersion: string;
  @ApiProperty({ type: String, nullable: true, description: '스토어 최신 버전 (미설정이면 null)' }) latestVersion: string | null;
  @ApiProperty({ type: String, nullable: true, description: '업데이트 받을 스토어 링크 (iOS 는 등록 전이면 null)' }) storeUrl: string | null;
  @ApiProperty({ type: String, nullable: true, description: '마스터가 적은 안내 문구' }) message: string | null;
  @ApiProperty({ type: Boolean, nullable: true, description: '보낸 version 이 최소 버전보다 낮으면 true. version 을 안 보냈으면 null' })
  updateRequired: boolean | null;
  @ApiProperty({ type: Boolean, nullable: true, description: '보낸 version 이 최신 버전보다 낮으면 true. version 을 안 보냈거나 최신 버전 미설정이면 null' })
  updateAvailable: boolean | null;

  constructor(row: OnchurchAppVersionRow, verdict: { updateRequired: boolean | null; updateAvailable: boolean | null }) {
    this.platform = row.platform;
    this.minVersion = row.minVersion;
    this.latestVersion = row.latestVersion;
    this.storeUrl = resolveOnchurchStoreUrl(row.platform, row.storeUrl);
    this.message = row.message;
    this.updateRequired = verdict.updateRequired;
    this.updateAvailable = verdict.updateAvailable;
  }
}

export class OnchurchMasterAppVersionResponse {
  @ApiProperty({ type: String }) platform: string;
  @ApiProperty({ type: String }) minVersion: string;
  @ApiProperty({ type: String, nullable: true }) latestVersion: string | null;
  @ApiProperty({ type: String, nullable: true }) message: string | null;
  @ApiProperty({ type: String, nullable: true, description: '마스터가 등록한 스토어 주소 (미등록이면 null)' }) storeUrl: string | null;
  @ApiProperty({ type: String, nullable: true, description: '앱에 실제로 내려가는 스토어 주소 (미등록 시 기본값 반영)' }) effectiveStoreUrl: string | null;
  @ApiProperty({ type: Number, nullable: true, description: '마지막으로 저장한 마스터 ID' }) updatedBy: number | null;
  @ApiProperty({ type: Date }) updatedAt: Date;

  constructor(row: OnchurchAppVersionRow) {
    this.platform = row.platform;
    this.minVersion = row.minVersion;
    this.latestVersion = row.latestVersion;
    this.message = row.message;
    this.storeUrl = row.storeUrl;
    this.effectiveStoreUrl = resolveOnchurchStoreUrl(row.platform, row.storeUrl);
    this.updatedBy = row.updatedBy;
    this.updatedAt = row.updatedAt;
  }
}

export class OnchurchMasterAppVersionsResponse {
  @ApiProperty({ type: [OnchurchMasterAppVersionResponse] }) versions: OnchurchMasterAppVersionResponse[];

  constructor(rows: OnchurchAppVersionRow[]) {
    this.versions = rows.map(row => new OnchurchMasterAppVersionResponse(row));
  }
}
