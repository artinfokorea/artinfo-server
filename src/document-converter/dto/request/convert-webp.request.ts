import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, Max, Min } from 'class-validator';
import { ToNumber } from '@/common/decorator/transformer';

export class ConvertWebpQuery {
  @IsOptional()
  @IsIn(['json', 'webp'])
  @ApiProperty({
    type: String,
    required: false,
    enum: ['json', 'webp'],
    description: 'json(기본): 모든 페이지를 base64 로 / webp: 한 페이지 WebP 바이너리로 응답',
  })
  format?: 'json' | 'webp';

  @IsOptional()
  @ToNumber()
  @ApiProperty({ type: Number, required: false, description: 'format=webp 일 때 돌려줄 페이지 (기본 1)', example: 1 })
  page?: number;

  @IsOptional()
  @ToNumber()
  @Min(1)
  @Max(4)
  @ApiProperty({ type: Number, required: false, description: '출력 배율 1~4 (기본 2, 1 = 96dpi · A4 가로 약 794px)', example: 2 })
  scale?: number;

  @IsOptional()
  @ToNumber()
  @Min(1)
  @Max(100)
  @ApiProperty({ type: Number, required: false, description: 'WebP 품질 1~100 (기본 80)', example: 80 })
  quality?: number;
}

export class ConvertWebpBody {
  @ApiProperty({ type: 'string', format: 'binary', description: 'HWP / HWPX / HWT / HWTX / PDF 파일' })
  file: unknown;
}
