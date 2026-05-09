export class OnchurchSermonSeriesWriteCommand {
  name: string;
  sortOrder: number;
  isActive: boolean;

  constructor(p: { name: string; sortOrder: number; isActive: boolean }) {
    this.name = p.name;
    this.sortOrder = p.sortOrder;
    this.isActive = p.isActive;
  }
}

export class OnchurchSermonWriteCommand {
  seriesId: number | null;
  title: string;
  pastor: string | null;
  date: string | null;
  duration: string | null;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  bulletinUrl: string | null;
  summary: string | null;
  isFeatured: boolean;
  sortOrder: number;
  isActive: boolean;

  constructor(p: {
    seriesId: number | null;
    title: string;
    pastor: string | null;
    date: string | null;
    duration: string | null;
    videoUrl: string | null;
    thumbnailUrl: string | null;
    bulletinUrl: string | null;
    summary: string | null;
    isFeatured: boolean;
    sortOrder: number;
    isActive: boolean;
  }) {
    this.seriesId = p.seriesId;
    this.title = p.title;
    this.pastor = p.pastor;
    this.date = p.date;
    this.duration = p.duration;
    this.videoUrl = p.videoUrl;
    this.thumbnailUrl = p.thumbnailUrl;
    this.bulletinUrl = p.bulletinUrl;
    this.summary = p.summary;
    this.isFeatured = p.isFeatured;
    this.sortOrder = p.sortOrder;
    this.isActive = p.isActive;
  }
}
