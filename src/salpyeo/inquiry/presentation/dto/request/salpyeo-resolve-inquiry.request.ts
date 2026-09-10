import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class SalpyeoResolveInquiryRequest {
  @IsBoolean()
  @ApiProperty({ type: Boolean, required: true, description: '처리 완료 여부', example: true })
  isResolved: boolean;
}
