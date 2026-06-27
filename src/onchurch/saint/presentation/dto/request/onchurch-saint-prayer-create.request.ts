import { ApiProperty } from '@nestjs/swagger';
import { MaxLength } from 'class-validator';
import { NotBlank } from '@/common/decorator/validator';

export class OnchurchSaintPrayerCreateRequest {
  @NotBlank()
  @MaxLength(2000)
  @ApiProperty({ type: String, required: true, description: '기도 내용', example: '건강 회복을 위해' })
  content: string;
}
