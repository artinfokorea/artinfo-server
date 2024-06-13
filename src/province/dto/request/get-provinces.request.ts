import { ApiProperty } from '@nestjs/swagger';

export class GetProvincesRequest {
  @ApiProperty({ type: 'number', required: false, description: '행정 구역 부모 아이디', example: 5 })
  parentId: number | null = null;
}
