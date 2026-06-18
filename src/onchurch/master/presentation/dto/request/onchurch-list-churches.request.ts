import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { List } from '@/common/type/type';

export class OnchurchListChurchesRequest extends List {
  @IsOptional()
  @IsString()
  @ApiProperty({ type: String, required: false, description: '검색 키워드 (교회명·소유자명·연락처)' })
  keyword?: string;

  // 생략 시 true(운영중인 교회만). 명시적으로 'false'를 보내면 전체 조회.
  @IsOptional()
  @Transform(({ value }) => value !== false && value !== 'false')
  @IsBoolean()
  @ApiProperty({ type: Boolean, required: false, default: true, description: '운영중(공개)인 교회만 조회 (기본 true)' })
  publishedOnly?: boolean = true;
}
