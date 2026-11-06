import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsString, Length } from 'class-validator';
import { ReportTargetType } from '@/moderation/artinfo-moderation.repository';

export const REPORT_TARGET_TYPES: ReportTargetType[] = ['POST', 'COMMENT', 'USER'];

export class ReportRequest {
  @IsIn(REPORT_TARGET_TYPES)
  @ApiProperty({ enum: REPORT_TARGET_TYPES, required: true, description: '신고 대상 종류', example: 'POST' })
  targetType: ReportTargetType;

  @IsInt()
  @ApiProperty({ type: Number, required: true, description: '신고 대상 ID (글·댓글·회원)', example: 31 })
  targetId: number;

  @IsString()
  @Length(1, 64)
  @ApiProperty({ type: String, required: true, description: '신고 사유 코드 (SPAM, ABUSE, SEXUAL, FRAUD, OTHER 등)', example: 'SPAM' })
  reason: string;
}

export class BlockRequest {
  @IsInt()
  @ApiProperty({ type: Number, required: true, description: '차단할 회원 ID', example: 9 })
  userId: number;
}
