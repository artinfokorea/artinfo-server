import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class OnchurchSearchUsersRequest {
  @IsOptional()
  @IsString()
  @ApiProperty({ type: String, required: false, description: '검색어 (이름·아이디·연락처)' })
  keyword?: string;
}
