import { ApiProperty } from '@nestjs/swagger';
import { AppVersionRow } from '@/app-version/app-version.repository';
import { STORE_URLS } from '@/app-version/app-version.domain';

/** 앱이 기동 시 받는 응답 — 전역 ResponseInterceptor 가 { code, message, item } 으로 감싼다 */
export class AppVersionCheckResponse {
  @ApiProperty({ type: String, description: 'ios / android' }) platform: string;
  @ApiProperty({ type: String, description: '이보다 낮으면 강제 업데이트' }) minVersion: string;
  @ApiProperty({ type: String, nullable: true, description: '스토어 최신 버전 (미설정이면 null)' }) latestVersion: string | null;
  @ApiProperty({ type: String, description: '업데이트 받을 스토어 링크' }) storeUrl: string;
  @ApiProperty({ type: String, nullable: true, description: '관리자가 적은 안내 문구' }) message: string | null;
  @ApiProperty({ type: Boolean, nullable: true, description: '보낸 version 이 최소 버전보다 낮으면 true. version 을 안 보냈으면 null' })
  updateRequired: boolean | null;
  @ApiProperty({ type: Boolean, nullable: true, description: '보낸 version 이 최신 버전보다 낮으면 true. version 을 안 보냈거나 최신 버전 미설정이면 null' })
  updateAvailable: boolean | null;

  constructor(row: AppVersionRow, verdict: { updateRequired: boolean | null; updateAvailable: boolean | null }) {
    this.platform = row.platform;
    this.minVersion = row.minVersion;
    this.latestVersion = row.latestVersion;
    this.storeUrl = STORE_URLS[row.platform];
    this.message = row.message;
    this.updateRequired = verdict.updateRequired;
    this.updateAvailable = verdict.updateAvailable;
  }
}

export class AdminAppVersionResponse {
  @ApiProperty({ type: String }) platform: string;
  @ApiProperty({ type: String }) minVersion: string;
  @ApiProperty({ type: String, nullable: true }) latestVersion: string | null;
  @ApiProperty({ type: String, nullable: true }) message: string | null;
  @ApiProperty({ type: String }) storeUrl: string;
  @ApiProperty({ type: Number, nullable: true, description: '마지막으로 저장한 관리자 ID' }) updatedBy: number | null;
  @ApiProperty({ type: Date }) updatedAt: Date;

  constructor(row: AppVersionRow) {
    this.platform = row.platform;
    this.minVersion = row.minVersion;
    this.latestVersion = row.latestVersion;
    this.message = row.message;
    this.storeUrl = STORE_URLS[row.platform];
    this.updatedBy = row.updatedBy;
    this.updatedAt = row.updatedAt;
  }
}

export class AdminAppVersionsResponse {
  @ApiProperty({ type: [AdminAppVersionResponse] }) versions: AdminAppVersionResponse[];

  constructor(rows: AppVersionRow[]) {
    this.versions = rows.map(row => new AdminAppVersionResponse(row));
  }
}
