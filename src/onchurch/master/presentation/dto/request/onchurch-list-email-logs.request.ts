import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { List } from '@/common/type/type';

export class OnchurchListEmailLogsRequest extends List {
  @IsOptional()
  @IsString()
  @ApiProperty({ type: String, required: false, description: '검색 키워드 (이메일 주소·제목·본문)' })
  keyword?: string;
}
