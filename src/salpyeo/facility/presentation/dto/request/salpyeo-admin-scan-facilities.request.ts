import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { SALPYEO_VERTICAL_KEYS, SalpyeoVerticalKey } from '@/salpyeo/facility/domain/constant/salpyeo-vertical.constant';

export class SalpyeoAdminScanFacilitiesRequest {
  @IsIn(SALPYEO_VERTICAL_KEYS, { message: 'vertical 값이 올바르지 않습니다.' })
  @ApiProperty({ enum: SALPYEO_VERTICAL_KEYS, required: true, description: '시설 종류', example: 'post' })
  vertical: SalpyeoVerticalKey;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  @ApiProperty({ type: String, required: false, description: '검색어 (이름·위치·주소 부분 일치)', example: '올리비움' })
  q?: string;
}
