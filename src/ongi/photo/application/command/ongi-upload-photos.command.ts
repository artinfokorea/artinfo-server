export interface OngiUploadPhotoItem {
  url: string;
  aspectRatio: number;
}

export interface OngiUploadTargetItem {
  groupId: number;
  albumId: number | null;
  personIds: number[];
}

export class OngiUploadPhotosCommand {
  photos: OngiUploadPhotoItem[];
  caption: string | null;
  targets: OngiUploadTargetItem[];

  constructor(p: { photos: OngiUploadPhotoItem[]; caption: string | null; targets: OngiUploadTargetItem[] }) {
    this.photos = p.photos;
    this.caption = p.caption;
    this.targets = p.targets;
  }
}
