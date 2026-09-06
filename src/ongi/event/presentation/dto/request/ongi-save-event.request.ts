import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsIn, IsInt, IsOptional, Matches, MaxLength } from 'class-validator';
import { NotBlank } from '@/common/decorator/validator';

export class OngiSaveEventRequest {
  @NotBlank()
  @MaxLength(80)
  @ApiProperty({ type: String, required: true, description: '일정 제목', example: '아버님 생신' })
  title: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @ApiProperty({ type: String, required: true, description: '날짜 (calendarType 기준) YYYY-MM-DD', example: '2026-09-12' })
  date: string;

  @IsOptional()
  @Matches(/^\d{2}:\d{2}$/)
  @ApiProperty({ type: String, required: false, nullable: true, description: 'HH:MM — 없으면 하루 종일', example: '19:00' })
  time?: string | null;

  @IsIn(['solar', 'lunar'])
  @ApiProperty({ type: String, required: true, enum: ['solar', 'lunar'], description: '양력/음력' })
  calendarType: 'solar' | 'lunar';

  @IsIn(['none', 'weekly', 'monthly', 'yearly'])
  @ApiProperty({ type: String, required: true, enum: ['none', 'weekly', 'monthly', 'yearly'], description: '반복' })
  repeatType: 'none' | 'weekly' | 'monthly' | 'yearly';

  @IsOptional()
  @MaxLength(500)
  @ApiProperty({ type: String, required: false, nullable: true, description: '메모' })
  memo?: string | null;

  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  @ApiProperty({ type: [Number], required: true, description: '등록·리마인드 푸시를 받을 사용자 id 목록' })
  notifyUserIds: number[];
}
