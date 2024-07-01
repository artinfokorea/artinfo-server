import { ApiProperty } from '@nestjs/swagger';
import { ToNumber } from '@/common/decorator/transformer';
import { IsNumber } from 'class-validator';

export interface UserSignature {
  id: number;
  name: string;
  email: string;
}

export interface Paging {
  page: number;
  size: number;
}

export interface PagingItems<T> {
  items: T[];
  totalCount: number;
}

export class List {
  @ToNumber()
  @IsNumber()
  @ApiProperty({ type: 'number', required: true, description: '페이지 번호', example: 1 })
  page: number;

  @ToNumber()
  @IsNumber()
  @ApiProperty({ type: 'number', required: true, description: '조회 개수', example: 1 })
  size: number;
}

export interface UploadFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}
