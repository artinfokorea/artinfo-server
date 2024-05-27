import { ApiProperty } from '@nestjs/swagger';

export class OkResponse {
  @ApiProperty({ type: 'string', required: true, description: '응답 코드', example: 'OK' })
  code: string = 'OK';

  @ApiProperty({ type: 'null', required: false, description: '응답 메세지', example: null })
  message: null;

  @ApiProperty({ type: 'null', required: false, description: '응답 아이템', example: null })
  item: null;
}
