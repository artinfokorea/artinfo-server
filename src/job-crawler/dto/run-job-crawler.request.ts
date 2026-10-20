import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, Matches } from 'class-validator';

export class RunJobCrawlerQuery {
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date 는 YYYY-MM-DD 형식이어야 합니다.' })
  @ApiProperty({ type: String, required: false, description: '수집할 등록일 (YYYY-MM-DD, 기본: 한국 시간 오늘)', example: '2026-10-20' })
  date?: string;
}
