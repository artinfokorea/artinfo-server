import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';

export class Holy365SearchQuery {
  @IsString()
  @MinLength(1)
  @MaxLength(40)
  @ApiProperty({ example: '사랑의교회' })
  q: string;
}

export class Holy365ListQuery {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  @ApiProperty({ required: false, example: 20 })
  limit?: number;
}

export class Holy365CreateChurchRequest {
  @IsOptional()
  @IsString()
  @MaxLength(32)
  @ApiProperty({ required: false, description: '카카오 장소 ID (검색 결과에서 고른 경우)' })
  kakaoPlaceId?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(80)
  @ApiProperty({ example: '사랑의교회' })
  name: string;

  @IsString()
  @MaxLength(80)
  @ApiProperty({ example: '서울 서초구', description: '지역 (직접 등록 시 필수 — 같은 교회 판단에 쓴다)' })
  region: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  @ApiProperty({ required: false })
  address?: string;
}

export class Holy365SocialResponse {
  @ApiProperty({ description: '응답 본문 — 각 API 설명 참고' })
  item: object;
}
