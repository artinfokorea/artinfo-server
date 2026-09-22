import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, ValidateIf } from 'class-validator';

export class OnchurchUpdateChurchCustomDomainRequest {
  // 교회 자체 도메인 대표 호스트. null/빈 값이면 연결 해제.
  @ValidateIf(o => o.customDomain !== null && o.customDomain !== undefined)
  @IsString()
  @MaxLength(253)
  @ApiProperty({
    type: String,
    required: true,
    nullable: true,
    description: "교회 자체 도메인 대표 호스트 (예: 'www.example.com'). null/빈 값이면 연결 해제",
  })
  customDomain: string | null;
}
