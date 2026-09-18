import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class OnchurchUpdateMySiteTemplateRequest {
  @IsOptional()
  @IsString()
  @ApiProperty({
    type: String,
    required: false,
    nullable: true,
    description: "공개 홈페이지 템플릿 ID. 빈 값/null이면 'default'",
    example: 'classic',
  })
  siteTemplate: string | null;
}
