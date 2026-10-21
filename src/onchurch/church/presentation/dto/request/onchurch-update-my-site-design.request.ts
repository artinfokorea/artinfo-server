import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsOptional } from 'class-validator';

export class OnchurchSiteDesignColorsRequest {
  @ApiProperty({ type: String, description: '메인 색 #rrggbb', example: '#1f3a5f' })
  main: string;

  @ApiProperty({ type: String, description: '포인트 색 #rrggbb', example: '#3b82c4' })
  point: string;
}

export class OnchurchUpdateMySiteDesignRequest {
  @IsOptional()
  @IsObject()
  @ApiProperty({ type: OnchurchSiteDesignColorsRequest, required: false, nullable: true, description: '메인·포인트 색. null 이면 템플릿 기본색' })
  colors: OnchurchSiteDesignColorsRequest | null;

  @IsOptional()
  @IsObject()
  @ApiProperty({
    required: false,
    nullable: true,
    description: "섹션키 → 디자인 ID ('default' | 'modern'). 없는 섹션은 site_template 기준으로 폴백",
    example: { worship: 'modern', pastor: 'default' },
  })
  sections: Record<string, string> | null;
}
