import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, MaxLength } from 'class-validator';
import { NotBlank } from '@/common/decorator/validator';

export class OnchurchPrayerSubmitRequest {
  @IsOptional()
  @MaxLength(80)
  @ApiProperty({ type: String, required: false, nullable: true, description: '이름 (익명 요청 시 빈값 가능)' })
  name: string | null;

  @IsOptional()
  @MaxLength(200)
  @ApiProperty({ type: String, required: false, nullable: true, description: '연락처' })
  contact: string | null;

  @NotBlank()
  @MaxLength(50)
  @ApiProperty({ type: String, required: true, description: '기도 분야', example: '가정' })
  category: string;

  @NotBlank()
  @MaxLength(50)
  @ApiProperty({ type: String, required: true, description: '공개 범위', example: '중보기도팀' })
  scope: string;

  @NotBlank()
  @ApiProperty({ type: String, required: true, description: '기도 제목 본문' })
  content: string;

  @IsBoolean()
  @ApiProperty({ type: Boolean, required: true, description: '익명 요청 여부' })
  isAnonymous: boolean;
}
