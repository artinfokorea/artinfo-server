export class OnchurchBannerWriteCommand {
  title: string;
  description: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  sortOrder: number;
  isActive: boolean;

  constructor(params: {
    title: string;
    description: string | null;
    imageUrl: string | null;
    linkUrl: string | null;
    sortOrder: number;
    isActive: boolean;
  }) {
    this.title = params.title;
    this.description = params.description;
    this.imageUrl = params.imageUrl;
    this.linkUrl = params.linkUrl;
    this.sortOrder = params.sortOrder;
    this.isActive = params.isActive;
  }
}
