import { ApiProperty } from '@nestjs/swagger';

export class OnchurchChurchPaidUntilResponse {
  @ApiProperty({ type: String, nullable: true, description: '결제 만료 시각(ISO)' }) paidUntil: string | null;
  @ApiProperty({ type: Boolean, description: '유료 결제 유효 여부' }) isPaidActive: boolean;

  constructor(paidUntil: Date | null) {
    this.paidUntil = paidUntil ? paidUntil.toISOString() : null;
    this.isPaidActive = !!paidUntil && paidUntil.getTime() > new Date().getTime();
  }
}
