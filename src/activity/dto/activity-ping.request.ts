import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class ActivityPingRequest {
  @IsString()
  @MaxLength(36)
  @ApiProperty({ type: String, description: '브라우저가 만든 방문자 UUID v4', example: '3f2b8c1e-9a4d-4e6f-8b2a-1c3d5e7f9a0b' })
  visitorId: string;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ type: Number, required: false, description: '지난 전송 이후 탭이 화면에 보인 시간(초). 최대 1800', example: 60 })
  seconds?: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ type: Number, required: false, description: '지난 전송 이후 새로 본 페이지 수. 최대 100', example: 1 })
  pageViews?: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  @ApiProperty({ type: String, required: false, description: '현재 페이지 경로 (쿼리 제외해서 저장)', example: '/jobs/487' })
  path?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  @ApiProperty({ type: String, required: false, description: '이번 전송 시점에 보고 있는 페이지 경로 — 그날 마지막 값이 이탈 페이지', example: '/jobs/487' })
  currentPath?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  @ApiProperty({ type: String, required: false, description: 'document.referrer — 외부 도메인만 저장', example: 'https://search.naver.com/' })
  referrer?: string;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ type: Boolean, required: false, description: '새 방문의 첫 전송이면 true (30분 넘게 쉬었다 온 경우 포함)' })
  newSession?: boolean;
}
