import { ApiProperty } from '@nestjs/swagger';
import { MaxLength } from 'class-validator';
import { NotBlank } from '@/common/decorator/validator';

export class OngiCreateAlbumRequest {
  @NotBlank()
  @MaxLength(60)
  @ApiProperty({ type: String, required: true, description: '앨범 이름', example: '서준이 성장기록' })
  title: string;
}
