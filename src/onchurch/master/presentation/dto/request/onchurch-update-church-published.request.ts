import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class OnchurchUpdateChurchPublishedRequest {
  // true면 교회 사이트 운영(공개), false면 미운영(비공개).
  @IsBoolean()
  @ApiProperty({ type: Boolean, required: true, description: '운영 여부. true면 공개, false면 비공개' })
  isPublished: boolean;
}
