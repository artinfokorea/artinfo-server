import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';

export class OnchurchDashboardRequest {
  @Matches(/^\d{4}-\d{2}$/, { message: '월은 YYYY-MM 형식이어야 합니다.' })
  @ApiProperty({ type: String, description: '조회할 월 (YYYY-MM)' })
  month: string;
}
