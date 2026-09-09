import { ApiProperty } from '@nestjs/swagger';
import { SALPYEO_VERTICAL_KEYS, SalpyeoVerticalKey } from '@/salpyeo/facility/domain/constant/salpyeo-vertical.constant';
import { SalpyeoVerticalWithCount } from '@/salpyeo/facility/application/usecase/salpyeo-scan-verticals.usecase';

export class SalpyeoVerticalResponse {
  @ApiProperty({ enum: SALPYEO_VERTICAL_KEYS, example: 'post' }) key: SalpyeoVerticalKey;
  @ApiProperty({ example: '산후조리원' }) label: string;
  @ApiProperty({ example: '2주 요금 · 보건소 점검 결과' }) sub: string;
  @ApiProperty({ example: '2주 일반실' }) priceLabel: string;
  @ApiProperty({ example: '모자보건법 요금 공개' }) source: string;
  @ApiProperty({ description: '데이터 기준일 (YYYY-MM-DD). 연동 전 버티컬은 null', example: '2023-12-31', nullable: true }) asOf: string | null;
  @ApiProperty({ description: '활성 시설 수', example: 456 }) count: number;
  @ApiProperty({ description: 'false 면 준비 중', example: true }) enabled: boolean;

  constructor(v: SalpyeoVerticalWithCount) {
    this.key = v.key;
    this.label = v.label;
    this.sub = v.sub;
    this.priceLabel = v.priceLabel;
    this.source = v.source;
    this.asOf = v.asOf;
    this.count = v.count;
    this.enabled = v.enabled;
  }
}

export class SalpyeoVerticalsResponse {
  @ApiProperty({ type: [SalpyeoVerticalResponse] }) verticals: SalpyeoVerticalResponse[];

  constructor(items: SalpyeoVerticalWithCount[]) {
    this.verticals = items.map(v => new SalpyeoVerticalResponse(v));
  }
}
