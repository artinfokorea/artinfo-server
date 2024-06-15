import { ApiProperty } from '@nestjs/swagger';

export class CreateResponse {
  @ApiProperty({ type: 'number', required: true, description: '생성 아이디', example: 5 })
  id: number;

  constructor(id: number) {
    this.id = id;
  }
}
