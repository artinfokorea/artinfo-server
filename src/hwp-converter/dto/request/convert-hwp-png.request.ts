import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { ToNumber } from '@/common/decorator/transformer';

export class ConvertHwpPngQuery {
  @IsOptional()
  @IsIn(['json', 'png'])
  @ApiProperty({
    type: String,
    required: false,
    enum: ['json', 'png'],
    description: 'json(기본): 모든 페이지를 base64 로 / png: 한 페이지 PNG 바이너리로 응답',
  })
  format?: 'json' | 'png';

  @IsOptional()
  @ToNumber()
  @ApiProperty({ type: Number, required: false, description: 'format=png 일 때 돌려줄 페이지 (기본 1)', example: 1 })
  page?: number;
}

export class ConvertHwpPngBody {
  @ApiProperty({ type: 'string', format: 'binary', description: 'HWP / HWPX / HWT / HWTX 파일' })
  file: unknown;
}
