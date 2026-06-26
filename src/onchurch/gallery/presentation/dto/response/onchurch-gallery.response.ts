import { ApiProperty } from '@nestjs/swagger';
import { OnchurchGallery } from '@/onchurch/gallery/domain/entity/onchurch-gallery.entity';
import { OnchurchGalleryCategory } from '@/onchurch/gallery/domain/entity/onchurch-gallery-category.entity';
import {
  PublicGalleryView,
  PublicGalleryGroup,
  PublicGalleryPhoto,
} from '@/onchurch/gallery/application/usecase/onchurch-list-public-gallery.usecase';

export class OnchurchGalleryCategoryResponse {
  @ApiProperty({ type: Number }) id: number;
  @ApiProperty({ type: String }) name: string;
  @ApiProperty({ type: Number }) sortOrder: number;
  @ApiProperty({ type: Boolean }) isActive: boolean;
  @ApiProperty({ type: Boolean }) isAll: boolean;

  constructor(c: OnchurchGalleryCategory) {
    this.id = c.id;
    this.name = c.name;
    this.sortOrder = c.sortOrder;
    this.isActive = c.isActive;
    this.isAll = !!c.isAll;
  }
}

export class OnchurchGalleryResponse {
  @ApiProperty({ type: Number }) id: number;
  @ApiProperty({ type: Number, nullable: true }) categoryId: number | null;
  @ApiProperty({ type: String, nullable: true }) batchId: string | null;
  @ApiProperty({ type: String }) title: string;
  @ApiProperty({ type: String, nullable: true }) date: string | null;
  @ApiProperty({ type: String, nullable: true }) photoUrl: string | null;
  @ApiProperty({ type: String, nullable: true }) grad: string | null;
  @ApiProperty({ type: Number }) sortOrder: number;
  @ApiProperty({ type: Boolean }) isActive: boolean;

  constructor(g: OnchurchGallery) {
    this.id = g.id;
    this.categoryId = g.categoryId;
    this.batchId = g.batchId;
    this.title = g.title;
    this.date = g.date;
    this.photoUrl = g.photoUrl;
    this.grad = g.grad;
    this.sortOrder = g.sortOrder;
    this.isActive = g.isActive;
  }
}

export class OnchurchGalleryCategoryListResponse {
  @ApiProperty({ type: [OnchurchGalleryCategoryResponse] })
  categories: OnchurchGalleryCategoryResponse[];
  constructor(items: OnchurchGalleryCategory[]) {
    this.categories = items.map(c => new OnchurchGalleryCategoryResponse(c));
  }
}

export class OnchurchGalleryListResponse {
  @ApiProperty({ type: [OnchurchGalleryResponse] })
  galleries: OnchurchGalleryResponse[];
  constructor(items: OnchurchGallery[]) {
    this.galleries = items.map(g => new OnchurchGalleryResponse(g));
  }
}

export class OnchurchGalleryGroupPhotoResponse {
  @ApiProperty({ type: Number }) id: number;
  @ApiProperty({ type: String, nullable: true }) photoUrl: string | null;
  @ApiProperty({ type: String, nullable: true }) grad: string | null;
  @ApiProperty({ type: String }) title: string;
  @ApiProperty({ type: String, nullable: true }) date: string | null;

  constructor(p: PublicGalleryPhoto) {
    this.id = p.id;
    this.photoUrl = p.photoUrl;
    this.grad = p.grad;
    this.title = p.title;
    this.date = p.date;
  }
}

export class OnchurchGalleryGroupResponse {
  @ApiProperty({ type: String }) groupKey: string;
  @ApiProperty({ type: Number, nullable: true }) categoryId: number | null;
  @ApiProperty({ type: String }) title: string;
  @ApiProperty({ type: String, nullable: true }) date: string | null;
  @ApiProperty({ type: String, nullable: true }) coverUrl: string | null;
  @ApiProperty({ type: String, nullable: true }) grad: string | null;
  @ApiProperty({ type: Number }) count: number;
  @ApiProperty({ type: [OnchurchGalleryGroupPhotoResponse] }) photos: OnchurchGalleryGroupPhotoResponse[];

  constructor(g: PublicGalleryGroup) {
    this.groupKey = g.groupKey;
    this.categoryId = g.categoryId;
    this.title = g.title;
    this.date = g.date;
    this.coverUrl = g.coverUrl;
    this.grad = g.grad;
    this.count = g.count;
    this.photos = g.photos.map(p => new OnchurchGalleryGroupPhotoResponse(p));
  }
}

export class OnchurchPublicGalleryResponse {
  @ApiProperty({ type: [OnchurchGalleryCategoryResponse] })
  categories: OnchurchGalleryCategoryResponse[];

  @ApiProperty({ type: [OnchurchGalleryGroupResponse] })
  groups: OnchurchGalleryGroupResponse[];

  @ApiProperty({ type: Number })
  totalCount: number;

  constructor(view: PublicGalleryView) {
    this.categories = view.categories.map(c => new OnchurchGalleryCategoryResponse(c));
    this.groups = view.groups.map(g => new OnchurchGalleryGroupResponse(g));
    this.totalCount = view.totalCount;
  }
}
