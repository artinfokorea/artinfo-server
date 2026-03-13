import { ApiProperty } from '@nestjs/swagger';

export class CreateIdsResponse {
  @ApiProperty({ type: [Number], required: true, description: '생성된 아이디 목록' })
  ids: number[];

  constructor(ids: number[]) {
    this.ids = ids;
  }
}
