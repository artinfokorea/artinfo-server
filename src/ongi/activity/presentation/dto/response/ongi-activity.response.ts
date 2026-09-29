import { ApiProperty } from '@nestjs/swagger';

export class OngiActivityOkResponse {
  @ApiProperty({ type: Boolean })
  ok = true;
}
