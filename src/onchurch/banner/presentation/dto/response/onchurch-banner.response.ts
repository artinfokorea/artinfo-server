import { ApiProperty } from '@nestjs/swagger';
import { OnchurchBanner } from '@/onchurch/banner/domain/entity/onchurch-banner.entity';
import { PublicBannerView } from '@/onchurch/banner/application/usecase/onchurch-list-public-banners.usecase';

export class OnchurchBannerResponse {
  @ApiProperty({ type: Number, required: true })
  id: number;

  @ApiProperty({ type: String, required: true })
  title: string;

  @ApiProperty({ type: String, required: false, nullable: true })
  description: string | null;

  @ApiProperty({ type: String, required: false, nullable: true })
  imageUrl: string | null;

  @ApiProperty({ type: String, required: false, nullable: true })
  linkUrl: string | null;

  @ApiProperty({ type: Number, required: true })
  sortOrder: number;

  @ApiProperty({ type: Boolean, required: true })
  isActive: boolean;

  constructor(banner: OnchurchBanner) {
    this.id = banner.id;
    this.title = banner.title;
    this.description = banner.description;
    this.imageUrl = banner.imageUrl;
    this.linkUrl = banner.linkUrl;
    this.sortOrder = banner.sortOrder;
    this.isActive = banner.isActive;
  }
}

export class OnchurchBannerListResponse {
  @ApiProperty({ type: [OnchurchBannerResponse], required: true })
  banners: OnchurchBannerResponse[];

  constructor(banners: OnchurchBanner[]) {
    this.banners = banners.map(b => new OnchurchBannerResponse(b));
  }
}

export class OnchurchPublicBannerResponse {
  @ApiProperty({ type: Number, required: false, nullable: true })
  id: number | null;

  @ApiProperty({ type: String, required: true })
  title: string;

  @ApiProperty({ type: String, required: false, nullable: true })
  description: string | null;

  @ApiProperty({ type: String, required: false, nullable: true })
  imageUrl: string | null;

  @ApiProperty({ type: String, required: false, nullable: true })
  linkUrl: string | null;

  @ApiProperty({ type: Boolean, required: true, description: '기본 배너(미등록 시 fallback) 여부' })
  isDefault: boolean;

  constructor(view: PublicBannerView) {
    this.id = view.id;
    this.title = view.title;
    this.description = view.description;
    this.imageUrl = view.imageUrl;
    this.linkUrl = view.linkUrl;
    this.isDefault = view.isDefault;
  }
}

export class OnchurchPublicBannerListResponse {
  @ApiProperty({ type: [OnchurchPublicBannerResponse], required: true })
  banners: OnchurchPublicBannerResponse[];

  constructor(views: PublicBannerView[]) {
    this.banners = views.map(v => new OnchurchPublicBannerResponse(v));
  }
}
