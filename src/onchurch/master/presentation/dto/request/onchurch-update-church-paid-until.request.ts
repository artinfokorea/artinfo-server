import { ApiProperty } from '@nestjs/swagger';
import { Matches, ValidateIf } from 'class-validator';

export class OnchurchUpdateChurchPaidUntilRequest {
  // 결제 만료일(YYYY-MM-DD). null이면 결제 만료일 해제.
  @ValidateIf((o) => o.paidUntil !== null && o.paidUntil !== undefined)
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: '결제 만료일은 YYYY-MM-DD 형식이어야 합니다.' })
  @ApiProperty({ type: String, required: true, nullable: true, description: '결제 만료일(YYYY-MM-DD). null이면 해제' })
  paidUntil: string | null;
}
