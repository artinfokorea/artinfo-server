import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class OnchurchBannerTypeRequest {
  @IsIn(['image', 'video'])
  @ApiProperty({ type: String, required: true, description: '홈에 노출할 배너 타입', enum: ['image', 'video'] })
  type: 'image' | 'video';
}
