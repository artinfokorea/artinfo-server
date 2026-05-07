import { ApiProperty } from '@nestjs/swagger';
import { OnchurchChurch } from '@/onchurch/church/domain/entity/onchurch-church.entity';

export class OnchurchChurchResponse {
  @ApiProperty({ type: Number, required: true })
  id: number;

  @ApiProperty({ type: String, required: true })
  slug: string;

  @ApiProperty({ type: String, required: true })
  name: string;

  @ApiProperty({ type: String, required: false, nullable: true })
  eng: string | null;

  @ApiProperty({ type: String, required: false, nullable: true })
  tagline: string | null;

  @ApiProperty({ type: String, required: false, nullable: true })
  phone: string | null;

  @ApiProperty({ type: String, required: false, nullable: true })
  email: string | null;

  @ApiProperty({ type: String, required: false, nullable: true })
  address: string | null;

  @ApiProperty({ type: String, required: false, nullable: true })
  representative: string | null;

  @ApiProperty({ type: String, required: false, nullable: true })
  businessNo: string | null;

  @ApiProperty({ type: String, required: false, nullable: true })
  logoUrl: string | null;

  @ApiProperty({ type: [String], required: true })
  enabledPages: string[];

  constructor(church: OnchurchChurch) {
    this.id = church.id;
    this.slug = church.slug;
    this.name = church.name;
    this.eng = church.eng;
    this.tagline = church.tagline;
    this.phone = church.phone;
    this.email = church.email;
    this.address = church.address;
    this.representative = church.representative;
    this.businessNo = church.businessNo;
    this.logoUrl = church.logoUrl;
    this.enabledPages = church.enabledPages ?? [];
  }
}

export class OnchurchMyChurchResponse {
  @ApiProperty({ type: OnchurchChurchResponse, required: false, nullable: true })
  church: OnchurchChurchResponse | null;

  constructor(church: OnchurchChurch | null) {
    this.church = church ? new OnchurchChurchResponse(church) : null;
  }
}
