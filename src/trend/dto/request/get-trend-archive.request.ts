import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, Matches, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export class GetTrendArchiveRequest {
  @ApiProperty({ description: '시작일 (KST, YYYY-MM-DD)', example: '2026-08-21' })
  @Matches(DATE_RE, { message: 'from은 YYYY-MM-DD 형식이어야 합니다.' })
  from: string;

  @ApiProperty({ description: '종료일 (KST, YYYY-MM-DD, 포함). 생략 시 from과 동일', example: '2026-08-21', required: false })
  @IsOptional()
  @Matches(DATE_RE, { message: 'to는 YYYY-MM-DD 형식이어야 합니다.' })
  to?: string;

  @ApiProperty({ description: '반환 개수 (1~100)', example: 20, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;
}
