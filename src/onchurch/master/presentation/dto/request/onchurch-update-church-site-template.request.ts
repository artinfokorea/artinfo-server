import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, ValidateIf } from 'class-validator';

export class OnchurchUpdateChurchSiteTemplateRequest {
  // 공개 홈페이지 템플릿 ID. null/빈 값이면 'default'로 초기화.
  @ValidateIf((o) => o.siteTemplate !== null && o.siteTemplate !== undefined)
  @IsString()
  @MaxLength(50)
  @ApiProperty({ type: String, required: true, nullable: true, description: "공개 홈페이지 템플릿 ID (예: 'default', 'classic'). null이면 default로 초기화" })
  siteTemplate: string | null;
}
