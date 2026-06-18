import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, Matches } from 'class-validator';
import { List } from '@/common/type/type';

export class OnchurchListLedgerEntriesRequest extends List {
  @IsOptional()
  @Matches(/^\d{4}-\d{2}$/, { message: '월은 YYYY-MM 형식이어야 합니다.' })
  @ApiProperty({ type: String, required: false, description: '조회할 월 (YYYY-MM). 생략 시 전체' })
  month?: string;
}
