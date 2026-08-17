import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, MaxLength } from 'class-validator';
import { NotBlank } from '@/common/decorator/validator';

export class OngiCreatePersonRequest {
  @NotBlank()
  @MaxLength(40)
  @ApiProperty({ type: String, required: true, description: '인물 이름', example: '서준' })
  name: string;

  @IsOptional()
  @ApiProperty({ type: String, required: false, description: '대표 이미지 URL' })
  imageUrl?: string;
}
