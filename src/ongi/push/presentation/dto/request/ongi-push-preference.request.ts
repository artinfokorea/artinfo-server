import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

/** 바꿀 항목만 보내면 된다 — 빠진 항목은 유지 */
export class OngiUpdatePushPreferencesRequest {
  @IsOptional()
  @IsBoolean()
  @ApiProperty({ type: Boolean, required: false, description: '새 사진·영상 알림' })
  photo?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ type: Boolean, required: false, description: '한마디(댓글) 알림' })
  comment?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ type: Boolean, required: false, description: '좋아요 알림' })
  like?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ type: Boolean, required: false, description: '일정 등록·변경·리마인더 알림' })
  event?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ type: Boolean, required: false, description: '가족 소식(새 구성원 참여) 알림' })
  family?: boolean;
}
