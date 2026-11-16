import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { VERSION_PATTERN } from '@/app-version/app-version.domain';

const VERSION_MESSAGE = '버전은 숫자와 점으로 1~4마디여야 합니다 (예: 1.2.0)';

/** 관리자 — 플랫폼별 최소/최신 버전 저장. 빈 문자열은 null 로 본다 */
export class SaveAppVersionRequest {
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
  @ApiProperty({
    type: String,
    required: false,
    nullable: true,
    description: '업데이트 안내 문구 (비우면 기본 문구)',
    example: '새 기능을 쓰려면 업데이트가 필요합니다.',
  })
  message?: string | null;
}
