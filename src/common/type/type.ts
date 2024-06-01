import { ApiProperty } from '@nestjs/swagger';

export interface UserSignature {
  id: number;
  name: string;
  email: string;
}

export interface Paging {
  page: number;
  size: number;
}

export class List {
  @ApiProperty({ type: 'number', required: true, description: '페이지 번호', example: 1 })
  page: number;

  @ApiProperty({ type: 'number', required: true, description: '조회 개수', example: 1 })
  size: number;
}
