import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsBoolean, IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min, ValidateNested } from 'class-validator';
import { HOMEPAGE_STATUSES, LEAD_STATUSES, HomepageStatus, LeadStatus } from '@/onchurch/sales/sales-lead';
import { SalesLeadFilter, SalesLeadRow, SalesLeadSearchResult } from '@/onchurch/sales/onchurch-sales-lead.repository';

export class OnchurchSalesLeadSearchRequest implements SalesLeadFilter {
  @IsOptional() @IsString() @MaxLength(100) @ApiProperty({ required: false, nullable: true }) keyword?: string | null;
  @IsOptional() @IsIn(LEAD_STATUSES) @ApiProperty({ required: false, nullable: true, enum: LEAD_STATUSES }) status?: LeadStatus | null;
  @IsOptional() @IsIn([...HOMEPAGE_STATUSES, 'need']) @ApiProperty({ required: false, nullable: true }) homepage?: HomepageStatus | 'need' | null;
  @IsOptional() @IsIn(['email', 'phone', 'any']) @ApiProperty({ required: false, nullable: true }) contact?: 'email' | 'phone' | 'any' | null;
  @IsOptional() @IsString() @MaxLength(80) @ApiProperty({ required: false, nullable: true }) region?: string | null;
  @IsOptional() @IsString() @MaxLength(80) @ApiProperty({ required: false, nullable: true }) denomination?: string | null;
  @IsInt() @Min(1) @ApiProperty() page: number;
  @IsInt() @Min(1) @Max(200) @ApiProperty() size: number;
}

/** 입력은 느슨하게 받고(붙여넣기 값), 정리는 usecase 가 한다. */
export class OnchurchSalesLeadInputDto {
  @IsString() @MaxLength(200) @ApiProperty() name: string;
  @IsOptional() @IsString() @MaxLength(200) @ApiProperty({ required: false, nullable: true }) denomination?: string | null;
  @IsOptional() @IsString() @MaxLength(200) @ApiProperty({ required: false, nullable: true }) region?: string | null;
  @IsOptional() @IsString() @MaxLength(500) @ApiProperty({ required: false, nullable: true }) address?: string | null;
  @IsOptional() @IsString() @MaxLength(200) @ApiProperty({ required: false, nullable: true }) pastor?: string | null;
  @IsOptional() @IsString() @MaxLength(100) @ApiProperty({ required: false, nullable: true }) phone?: string | null;
  @IsOptional() @IsString() @MaxLength(300) @ApiProperty({ required: false, nullable: true }) email?: string | null;
  @IsOptional() @IsString() @MaxLength(100) @ApiProperty({ required: false, nullable: true }) homepageStatus?: string | null;
  @IsOptional() @IsString() @MaxLength(500) @ApiProperty({ required: false, nullable: true }) homepageUrl?: string | null;
  @IsOptional() @IsString() @MaxLength(200) @ApiProperty({ required: false, nullable: true }) source?: string | null;
  @IsOptional() @IsString() @MaxLength(20) @ApiProperty({ required: false, nullable: true }) status?: string | null;
  @IsOptional() @IsBoolean() @ApiProperty({ required: false }) emailConsent?: boolean;
  @IsOptional() @IsString() @MaxLength(4000) @ApiProperty({ required: false, nullable: true }) memo?: string | null;
}

export class OnchurchSalesLeadImportRequest {
  @IsArray()
  @ArrayMaxSize(1000)
  @ValidateNested({ each: true })
  @Type(() => OnchurchSalesLeadInputDto)
  @ApiProperty({ type: [OnchurchSalesLeadInputDto] })
  rows: OnchurchSalesLeadInputDto[];
}

export class OnchurchSalesLeadDeleteRequest {
  @IsArray() @ArrayMaxSize(1000) @IsInt({ each: true }) @ApiProperty({ type: [Number] }) ids: number[];
}

export class OnchurchSalesLeadDto {
  @ApiProperty() id: number;
  @ApiProperty() name: string;
  @ApiProperty({ type: String, nullable: true }) denomination: string | null;
  @ApiProperty({ type: String, nullable: true }) region: string | null;
  @ApiProperty({ type: String, nullable: true }) address: string | null;
  @ApiProperty({ type: String, nullable: true }) pastor: string | null;
  @ApiProperty({ type: String, nullable: true }) phone: string | null;
  @ApiProperty({ type: String, nullable: true }) email: string | null;
  @ApiProperty({ enum: HOMEPAGE_STATUSES }) homepageStatus: HomepageStatus;
  @ApiProperty({ type: String, nullable: true }) homepageUrl: string | null;
  @ApiProperty({ type: String, nullable: true }) source: string | null;
  @ApiProperty({ enum: LEAD_STATUSES }) status: LeadStatus;
  @ApiProperty() emailConsent: boolean;
  @ApiProperty({ type: String, nullable: true }) memo: string | null;
  @ApiProperty({ type: String, nullable: true }) lastContactedAt: string | null;
  @ApiProperty() createdAt: string;
  @ApiProperty() updatedAt: string;
  constructor(r: SalesLeadRow) {
    Object.assign(this, r);
  }
}

export class OnchurchSalesLeadSearchResponse {
  @ApiProperty({ type: [OnchurchSalesLeadDto] }) items: OnchurchSalesLeadDto[];
  @ApiProperty() total: number;
  @ApiProperty({ type: Object }) counts: Record<string, number>;
  constructor(r: SalesLeadSearchResult) {
    this.items = r.items.map(i => new OnchurchSalesLeadDto(i));
    this.total = r.total;
    this.counts = r.counts;
  }
}

export class OnchurchSalesLeadImportResponse {
  @ApiProperty() created: number;
  @ApiProperty() skipped: number;
  @ApiProperty() invalid: number;
  constructor(r: { created: number; skipped: number; invalid: number }) {
    Object.assign(this, r);
  }
}

export class OnchurchSalesLeadDeleteResponse {
  @ApiProperty() deleted: number;
  constructor(deleted: number) {
    this.deleted = deleted;
  }
}
