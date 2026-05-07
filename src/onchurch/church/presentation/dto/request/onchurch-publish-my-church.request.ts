import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class OnchurchPublishMyChurchRequest {
  @IsBoolean()
  @ApiProperty({ type: Boolean, required: true, description: '사이트 운영 여부 (true=공개, false=비공개)' })
  isPublished: boolean;
}
