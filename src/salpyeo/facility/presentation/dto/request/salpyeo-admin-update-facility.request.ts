import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min, ValidateNested } from 'class-validator';

export class SalpyeoAdminPriceRowRequest {
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  @ApiProperty({ example: '일반실' })
  room: string;

  @IsString()
  @MaxLength(100)
  @ApiProperty({ example: '2주 기준 · 2023.12.31 공개 요금' })
  note: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  @ApiProperty({ description: '표시용 문자열', example: '470만원' })
  price: string;
}

export class SalpyeoAdminImageRequest {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  @ApiProperty({ example: 'https://example.com/room.jpg' })
  url: string;

  @IsString()
  @MaxLength(60)
  @ApiProperty({ description: '캡션 겸 대체 텍스트', example: '신생아실' })
  alt: string;

  @IsInt()
  @Min(0)
  @ApiProperty({ example: 1200 })
  width: number;

  @IsInt()
  @Min(0)
  @ApiProperty({ example: 800 })
  height: number;
}

/** 보낸 필드만 반영한다 (부분 수정). 길이 제한은 컬럼 정의와 맞춘다. */
export class SalpyeoAdminUpdateFacilityRequest {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @ApiPropertyOptional({ example: '올리비움산후조리원' })
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  @ApiPropertyOptional({ description: '위치 요약', example: '서울 종로구' })
  meta?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  @ApiPropertyOptional({ example: '서울' })
  sido?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  @ApiPropertyOptional({ example: '종로구' })
  sigungu?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  @ApiPropertyOptional({ description: '운영주체', example: '민간' })
  operatorType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  @ApiPropertyOptional({ example: '서울시 종로구 통일로 16길 4-1' })
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  @ApiPropertyOptional({ example: '02-730-1717' })
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  @ApiPropertyOptional({ description: '공식 홈페이지. 없으면 빈 문자열', example: 'https://www.olivium.co.kr/' })
  website?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  @ApiPropertyOptional({ description: '점검·평가 배지', example: '' })
  inspectionBadge?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  @ApiPropertyOptional({ description: '특성 배지', example: '민간 운영' })
  featureBadge?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1_000_000_000)
  @ApiPropertyOptional({ description: '대표 가격 (원). 0 = 미공개', example: 4700000 })
  price?: number;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @ValidateNested({ each: true })
  @Type(() => SalpyeoAdminPriceRowRequest)
  @ApiPropertyOptional({ type: [SalpyeoAdminPriceRowRequest] })
  priceRows?: SalpyeoAdminPriceRowRequest[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @ValidateNested({ each: true })
  @Type(() => SalpyeoAdminImageRequest)
  @ApiPropertyOptional({ type: [SalpyeoAdminImageRequest] })
  images?: SalpyeoAdminImageRequest[];

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ description: '노출 여부 — false 면 공개 API 에서 사라진다', example: true })
  isActive?: boolean;
}
