import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { SALPYEO_VERTICAL_KEYS, SalpyeoVerticalKey } from '@/salpyeo/facility/domain/constant/salpyeo-vertical.constant';
import { SALPYEO_FACILITY_SORTS, SalpyeoFacilitySort } from '@/salpyeo/facility/domain/service/salpyeo-facility-query';
import { SalpyeoScanFacilitiesQuery } from '@/salpyeo/facility/application/usecase/salpyeo-scan-facilities.usecase';

export class SalpyeoScanFacilitiesRequest {
  @IsIn(SALPYEO_VERTICAL_KEYS, { message: 'vertical 값이 올바르지 않습니다.' })
  @ApiProperty({ enum: SALPYEO_VERTICAL_KEYS, required: true, description: '시설 종류', example: 'post' })
  vertical: SalpyeoVerticalKey;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  @ApiProperty({ type: String, required: false, description: '검색어 (이름·위치 부분 일치)', example: '라온' })
  q?: string;

  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : String(value).split(',')).map((s: string) => s.trim()).filter(Boolean))
  @IsString({ each: true })
  @ApiProperty({ type: String, required: false, description: '비교할 시설 slug (쉼표 구분)', example: 'p1,p2' })
  slugs?: string[];

  @IsOptional()
  @IsIn(SALPYEO_FACILITY_SORTS, { message: 'sort 값이 올바르지 않습니다.' })
  @ApiProperty({ enum: SALPYEO_FACILITY_SORTS, required: false, description: '정렬 기준 (기본 priceAsc)', example: 'priceAsc' })
  sort?: SalpyeoFacilitySort;

  toQuery(): SalpyeoScanFacilitiesQuery {
    return { vertical: this.vertical, keyword: this.q, slugs: this.slugs, sort: this.sort };
  }
}
