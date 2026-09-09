import { ApiProperty } from '@nestjs/swagger';
import {
  SalpyeoFacility,
  SalpyeoFacilityImage,
  SalpyeoInspection,
  SalpyeoPriceRow,
  SalpyeoReview,
} from '@/salpyeo/facility/domain/entity/salpyeo-facility.entity';
import { SALPYEO_VERTICAL_KEYS, SalpyeoVerticalKey } from '@/salpyeo/facility/domain/constant/salpyeo-vertical.constant';

export class SalpyeoFacilityImageResponse implements SalpyeoFacilityImage {
  @ApiProperty() url: string;
  @ApiProperty({ example: '신생아실' }) alt: string;
  @ApiProperty({ example: 1200 }) width: number;
  @ApiProperty({ example: 800 }) height: number;
}

export class SalpyeoPriceRowResponse implements SalpyeoPriceRow {
  @ApiProperty({ example: '일반실' }) room: string;
  @ApiProperty({ example: '2주 · 모자동실 선택 가능' }) note: string;
  @ApiProperty({ description: '표시용 문자열', example: '480만원' }) price: string;
}

export class SalpyeoInspectionResponse implements SalpyeoInspection {
  @ApiProperty({ example: '정기 위생 점검' }) title: string;
  @ApiProperty({ example: '분당구보건소 · 2026.05' }) date: string;
  @ApiProperty({ example: '지적 없음' }) result: string;
}

export class SalpyeoReviewResponse implements SalpyeoReview {
  @ApiProperty({ example: '2026.07 이용' }) meta: string;
  @ApiProperty() text: string;
}

export class SalpyeoDistanceResponse {
  @ApiProperty({ example: '차 8분' }) label: string;
  @ApiProperty({ example: 8 }) minutes: number;
}

export class SalpyeoBadgesResponse {
  @ApiProperty({ description: '점검·평가 배지. 점검 데이터 연동 전에는 빈 문자열', example: '' }) inspection: string;
  @ApiProperty({ description: '특성 배지', example: '민간 운영' }) feature: string;
}

export class SalpyeoRegionResponse {
  @ApiProperty({ example: '서울' }) sido: string;
  @ApiProperty({ example: '종로구' }) sigungu: string;
}

export class SalpyeoFacilityResponse {
  @ApiProperty({ description: 'URL 식별자', example: 'p1' }) slug: string;
  @ApiProperty({ enum: SALPYEO_VERTICAL_KEYS, example: 'post' }) vertical: SalpyeoVerticalKey;
  @ApiProperty({ example: '올리비움산후조리원' }) name: string;
  @ApiProperty({ description: '위치 요약 (시도 시군구)', example: '서울 종로구' }) meta: string;
  @ApiProperty({ type: SalpyeoRegionResponse }) region: SalpyeoRegionResponse;
  @ApiProperty({ description: '운영주체', example: '민간' }) operator: string;
  @ApiProperty({ example: '서울시 종로구 통일로 16길 4-1' }) address: string;
  @ApiProperty({ example: '02-730-1717' }) phone: string;
  @ApiProperty({ description: '공식 홈페이지. 못 찾았으면 빈 문자열', example: 'https://www.olivium.co.kr/' }) website: string;
  @ApiProperty({ type: SalpyeoDistanceResponse, description: '사용자 위치 기능 전에는 label "" / minutes 0' }) distance: SalpyeoDistanceResponse;
  @ApiProperty({ type: SalpyeoBadgesResponse }) badges: SalpyeoBadgesResponse;
  @ApiProperty({ description: '대표 가격 (원). 0 = 미공개', example: 4700000 }) price: number;
  @ApiProperty({ description: '후기 연동 전에는 0', example: 0 }) rating: number;
  @ApiProperty({ example: 0 }) reviewCount: number;
  @ApiProperty({ description: '같은 시도 평균 대비 % (음수 = 저렴)', example: 9 }) vsAvgPercent: number;
  @ApiProperty({ type: [SalpyeoFacilityImageResponse] }) images: SalpyeoFacilityImageResponse[];
  @ApiProperty({ type: [SalpyeoPriceRowResponse] }) priceRows: SalpyeoPriceRowResponse[];
  @ApiProperty({ type: [SalpyeoInspectionResponse] }) inspections: SalpyeoInspectionResponse[];
  @ApiProperty({ type: SalpyeoReviewResponse, nullable: true }) review: SalpyeoReviewResponse | null;

  constructor(f: SalpyeoFacility) {
    this.slug = f.slug;
    this.vertical = f.vertical;
    this.name = f.name;
    this.meta = f.meta;
    this.region = { sido: f.sido, sigungu: f.sigungu };
    this.operator = f.operatorType;
    this.address = f.address;
    this.phone = f.phone;
    this.website = f.website;
    this.distance = { label: f.distanceLabel, minutes: f.distanceMinutes };
    this.badges = { inspection: f.inspectionBadge, feature: f.featureBadge };
    this.price = f.price;
    this.rating = Number(f.rating);
    this.reviewCount = f.reviewCount;
    this.vsAvgPercent = f.vsAvgPercent;
    this.images = f.images ?? [];
    this.priceRows = f.priceRows ?? [];
    this.inspections = f.inspections ?? [];
    this.review = f.review ?? null;
  }
}

export class SalpyeoFacilitiesResponse {
  @ApiProperty({ type: [SalpyeoFacilityResponse] }) facilities: SalpyeoFacilityResponse[];

  constructor(items: SalpyeoFacility[]) {
    this.facilities = items.map(f => new SalpyeoFacilityResponse(f));
  }
}
