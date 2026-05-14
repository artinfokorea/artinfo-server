import { ApiProperty } from '@nestjs/swagger';
import { OnchurchGallery } from '@/onchurch/gallery/domain/entity/onchurch-gallery.entity';
import { OnchurchGalleryCategory } from '@/onchurch/gallery/domain/entity/onchurch-gallery-category.entity';
import { PublicGalleryView } from '@/onchurch/gallery/application/usecase/onchurch-list-public-gallery.usecase';

export class OnchurchGalleryCategoryResponse {
  @ApiProperty({ type: Number }) id: number;
  @ApiProperty({ type: String }) name: string;
  @ApiProperty({ type: Number }) sortOrder: number;
  @ApiProperty({ type: Boolean }) isActive: boolean;

  constructor(c: OnchurchGalleryCategory) {
    this.id = c.id;
    this.name = c.name;
    this.sortOrder = c.sortOrder;
    this.isActive = c.isActive;
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

export class OnchurchPublicGalleryResponse {
  @ApiProperty({ type: [OnchurchGalleryCategoryResponse] })
  categories: OnchurchGalleryCategoryResponse[];

  @ApiProperty({ type: [OnchurchGalleryResponse] })
  galleries: OnchurchGalleryResponse[];

  constructor(view: PublicGalleryView) {
    this.categories = view.categories.map(c => new OnchurchGalleryCategoryResponse(c));
    this.galleries = view.galleries.map(g => new OnchurchGalleryResponse(g));
  }
}
