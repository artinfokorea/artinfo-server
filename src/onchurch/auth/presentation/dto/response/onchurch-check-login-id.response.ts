import { ApiProperty } from '@nestjs/swagger';

export class OnchurchCheckLoginIdResponse {
  @ApiProperty({ type: Boolean, required: true, description: '사용 가능 여부 (true=사용 가능, false=중복)' })
  available: boolean;

  constructor(available: boolean) {
    this.available = available;
  }
}
