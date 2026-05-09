import { ApiProperty } from '@nestjs/swagger';
import { OnchurchSermon } from '@/onchurch/sermon/domain/entity/onchurch-sermon.entity';
import { OnchurchSermonSeries } from '@/onchurch/sermon/domain/entity/onchurch-sermon-series.entity';
import { PublicSermonView } from '@/onchurch/sermon/application/usecase/onchurch-list-public-sermons.usecase';

export class OnchurchSermonSeriesResponse {
  @ApiProperty({ type: Number }) id: number;
  @ApiProperty({ type: String }) name: string;
  @ApiProperty({ type: Number }) sortOrder: number;
  @ApiProperty({ type: Boolean }) isActive: boolean;

  constructor(s: OnchurchSermonSeries) {
    this.id = s.id;
    this.name = s.name;
    this.sortOrder = s.sortOrder;
    this.isActive = s.isActive;
  }
}

export class OnchurchSermonResponse {
  @ApiProperty({ type: Number }) id: number;
  @ApiProperty({ type: Number, nullable: true }) seriesId: number | null;
  @ApiProperty({ type: String }) title: string;
  @ApiProperty({ type: String, nullable: true }) pastor: string | null;
  @ApiProperty({ type: String, nullable: true }) date: string | null;
  @ApiProperty({ type: String, nullable: true }) duration: string | null;
  @ApiProperty({ type: String, nullable: true }) videoUrl: string | null;
  @ApiProperty({ type: String, nullable: true }) thumbnailUrl: string | null;
  @ApiProperty({ type: String, nullable: true }) bulletinUrl: string | null;
  @ApiProperty({ type: String, nullable: true }) summary: string | null;
  @ApiProperty({ type: Boolean }) isFeatured: boolean;
  @ApiProperty({ type: Number }) sortOrder: number;
  @ApiProperty({ type: Boolean }) isActive: boolean;

  constructor(s: OnchurchSermon) {
    this.id = s.id;
    this.seriesId = s.seriesId;
    this.title = s.title;
    this.pastor = s.pastor;
    this.date = s.date;
    this.duration = s.duration;
    this.videoUrl = s.videoUrl;
    this.thumbnailUrl = s.thumbnailUrl;
    this.bulletinUrl = s.bulletinUrl;
    this.summary = s.summary;
    this.isFeatured = s.isFeatured;
    this.sortOrder = s.sortOrder;
    this.isActive = s.isActive;
  }
}

export class OnchurchSermonSeriesListResponse {
  @ApiProperty({ type: [OnchurchSermonSeriesResponse] })
  series: OnchurchSermonSeriesResponse[];
  constructor(items: OnchurchSermonSeries[]) {
    this.series = items.map(s => new OnchurchSermonSeriesResponse(s));
  }
}

export class OnchurchSermonListResponse {
  @ApiProperty({ type: [OnchurchSermonResponse] })
  sermons: OnchurchSermonResponse[];
  constructor(items: OnchurchSermon[]) {
    this.sermons = items.map(s => new OnchurchSermonResponse(s));
  }
}

export class OnchurchPublicSermonResponse {
  @ApiProperty({ type: [OnchurchSermonSeriesResponse] })
  series: OnchurchSermonSeriesResponse[];

  @ApiProperty({ type: [OnchurchSermonResponse] })
  sermons: OnchurchSermonResponse[];

  constructor(view: PublicSermonView) {
    this.series = view.series.map(s => new OnchurchSermonSeriesResponse(s));
    this.sermons = view.sermons.map(s => new OnchurchSermonResponse(s));
  }
}
