import { ApiProperty } from '@nestjs/swagger';
import { SalpyeoFacility } from '@/salpyeo/facility/domain/entity/salpyeo-facility.entity';
import { SALPYEO_VERTICAL_KEYS, SalpyeoVerticalKey } from '@/salpyeo/facility/domain/constant/salpyeo-vertical.constant';
import { SalpyeoFacilityImageResponse, SalpyeoPriceRowResponse } from '@/salpyeo/facility/presentation/dto/response/salpyeo-facility.response';

/**
 * 관리자 화면은 공개 응답과 달리 저장된 컬럼을 그대로 돌려준다 (편집 폼에 그대로 채워 넣기 위해).
 * 공개 응답의 region·badges 처럼 묶지 않는다.
 */
export class SalpyeoAdminFacilityResponse {
  @ApiProperty({ example: 'post-a9656bde' }) slug: string;
  @ApiProperty({ enum: SALPYEO_VERTICAL_KEYS, example: 'post' }) vertical: SalpyeoVerticalKey;
  @ApiProperty({ example: '올리비움산후조리원' }) name: string;
  @ApiProperty({ description: '위치 요약', example: '서울 종로구' }) meta: string;
  @ApiProperty({ example: '서울' }) sido: string;
  @ApiProperty({ example: '종로구' }) sigungu: string;
  @ApiProperty({ description: '운영주체', example: '민간' }) operatorType: string;
  @ApiProperty({ example: '서울시 종로구 통일로 16길 4-1' }) address: string;
  @ApiProperty({ example: '02-730-1717' }) phone: string;
  @ApiProperty({ description: '공식 홈페이지. 못 찾았으면 빈 문자열', example: 'https://www.olivium.co.kr/' }) website: string;
  @ApiProperty({ description: '점검·평가 배지', example: '' }) inspectionBadge: string;
  @ApiProperty({ description: '특성 배지', example: '민간 운영' }) featureBadge: string;
  @ApiProperty({ description: '대표 가격 (원). 0 = 미공개', example: 4700000 }) price: number;
  @ApiProperty({ type: [SalpyeoPriceRowResponse] }) priceRows: SalpyeoPriceRowResponse[];
  @ApiProperty({ type: [SalpyeoFacilityImageResponse] }) images: SalpyeoFacilityImageResponse[];
  @ApiProperty({ description: '노출 여부', example: true }) isActive: boolean;
  @ApiProperty({ description: '마지막 수정 시각' }) updatedAt: Date;

  constructor(f: SalpyeoFacility) {
    this.slug = f.slug;
    this.vertical = f.vertical;
    this.name = f.name;
    this.meta = f.meta;
    this.sido = f.sido;
    this.sigungu = f.sigungu;
    this.operatorType = f.operatorType;
    this.address = f.address;
    this.phone = f.phone;
    this.website = f.website;
    this.inspectionBadge = f.inspectionBadge;
    this.featureBadge = f.featureBadge;
    this.price = f.price;
    this.priceRows = f.priceRows ?? [];
    this.images = f.images ?? [];
    this.isActive = f.isActive;
    this.updatedAt = f.updatedAt;
  }
}

export class SalpyeoAdminFacilitiesResponse {
  @ApiProperty({ type: [SalpyeoAdminFacilityResponse] }) facilities: SalpyeoAdminFacilityResponse[];

  constructor(items: SalpyeoFacility[]) {
    this.facilities = items.map(f => new SalpyeoAdminFacilityResponse(f));
  }
}
