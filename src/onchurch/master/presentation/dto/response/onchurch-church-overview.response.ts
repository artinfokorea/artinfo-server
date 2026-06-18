import { ApiProperty } from '@nestjs/swagger';
import { OnchurchChurchOverviewRow } from '@/onchurch/master/domain/repository/onchurch-church-overview.repository.interface';

function toIso(date: Date | null): string | null {
  return date ? date.toISOString() : null;
}

export class OnchurchChurchOverviewResponse {
  @ApiProperty({ type: Number }) id: number;
  @ApiProperty({ type: String, description: '교회 이름' }) name: string;
  @ApiProperty({ type: String, description: '서브도메인 슬러그' }) slug: string;
  @ApiProperty({ type: String, nullable: true, description: '교회 주소' }) address: string | null;
  @ApiProperty({ type: Boolean, description: '사이트 운영(공개) 여부' }) isPublished: boolean;
  @ApiProperty({ type: String, nullable: true, description: '소유자 이름' }) ownerName: string | null;
  @ApiProperty({ type: String, nullable: true, description: '소유자 연락처' }) ownerPhone: string | null;
  @ApiProperty({ type: String, nullable: true, description: '프리티어 시작 시각(최초 운영 시작, ISO)' }) freeTrialStartAt: string | null;
  @ApiProperty({ type: String, nullable: true, description: '프리티어 종료 시각(ISO)' }) freeTrialUntil: string | null;
  @ApiProperty({ type: String, nullable: true, description: '결제 만료 시각(ISO)' }) paidUntil: string | null;
  @ApiProperty({ type: Boolean, description: '프리티어 유효 여부' }) isFreeTrialActive: boolean;
  @ApiProperty({ type: Boolean, description: '유료 결제 유효 여부' }) isPaidActive: boolean;

  constructor(row: OnchurchChurchOverviewRow, now: Date) {
    this.id = row.id;
    this.name = row.name;
    this.slug = row.slug;
    this.isPublished = row.isPublished;
    this.ownerName = row.ownerName;
    this.ownerPhone = row.ownerPhone;
    this.freeTrialStartAt = toIso(row.firstPublishedAt);
    this.freeTrialUntil = toIso(row.freeTrialUntil);
    this.paidUntil = toIso(row.paidUntil);
    this.isFreeTrialActive = !!row.freeTrialUntil && row.freeTrialUntil.getTime() > now.getTime();
    this.isPaidActive = !!row.paidUntil && row.paidUntil.getTime() > now.getTime();
  }
}

export class OnchurchChurchOverviewListResponse {
  @ApiProperty({ type: [OnchurchChurchOverviewResponse] }) items: OnchurchChurchOverviewResponse[];
  @ApiProperty({ type: Number, description: '검색 조건에 해당하는 전체 건수' }) totalCount: number;

  constructor(params: { items: OnchurchChurchOverviewRow[]; totalCount: number }) {
    const now = new Date();
    this.items = params.items.map((row) => new OnchurchChurchOverviewResponse(row, now));
    this.totalCount = params.totalCount;
  }
}
