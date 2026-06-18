import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { List } from '@/common/type/type';

export class OnchurchListChurchesRequest extends List {
  @IsOptional()
  @IsString()
  @ApiProperty({ type: String, required: false, description: '검색 키워드 (교회명·소유자명·연락처)' })
  keyword?: string;
}
