import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, MaxLength } from 'class-validator';

export class OngiUpdatePhotoRequest {
  @IsOptional()
  @MaxLength(500)
  @ApiProperty({ type: String, required: false, nullable: true, description: '문구 (빈 값이면 삭제)', example: '오늘 공원에서' })
  caption?: string | null;

  @IsOptional()
  @ApiProperty({ type: String, required: false, nullable: true, description: '담을 앨범 id (null 이면 미분류)', example: '2' })
  albumId?: string | null;
}
