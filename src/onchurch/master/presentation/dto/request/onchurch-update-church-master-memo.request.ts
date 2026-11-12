import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, ValidateIf } from 'class-validator';

export class OnchurchUpdateChurchMasterMemoRequest {
  // 마스터 전용 메모. null 또는 빈 문자열이면 삭제.
  @ValidateIf(o => o.masterMemo !== null && o.masterMemo !== undefined)
  @IsString()
  @MaxLength(2000)
  @ApiProperty({ type: String, required: true, nullable: true, description: '마스터 전용 메모. null이면 삭제' })
  masterMemo: string | null;
}
