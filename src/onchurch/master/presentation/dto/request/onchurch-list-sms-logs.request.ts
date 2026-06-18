import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { List } from '@/common/type/type';

export class OnchurchListSmsLogsRequest extends List {
  @IsOptional()
  @IsString()
  @ApiProperty({ type: String, required: false, description: '검색 키워드 (휴대폰 번호·제목·본문)' })
  keyword?: string;
}
