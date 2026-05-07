import { ApiProperty } from '@nestjs/swagger';

export class OnchurchCheckSlugResponse {
  @ApiProperty({ type: Boolean, required: true, description: '서브도메인 사용 가능 여부' })
  available: boolean;

  constructor(available: boolean) {
    this.available = available;
  }
}
