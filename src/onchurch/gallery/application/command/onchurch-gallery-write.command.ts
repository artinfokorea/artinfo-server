export class OnchurchGalleryCategoryWriteCommand {
  name: string;
  sortOrder: number;
  isActive: boolean;

  constructor(p: { name: string; sortOrder: number; isActive: boolean }) {
    this.name = p.name;
    this.sortOrder = p.sortOrder;
    this.isActive = p.isActive;
  }
}

export class OnchurchGalleryWriteCommand {
  categoryId: number | null;
  title: string;
  date: string | null;
  photoUrl: string | null;
  grad: string | null;
  sortOrder: number;
  isActive: boolean;

  constructor(p: {
    categoryId: number | null;
    title: string;
    date: string | null;
    photoUrl: string | null;
    grad: string | null;
    sortOrder: number;
    isActive: boolean;
  }) {
    this.categoryId = p.categoryId;
    this.title = p.title;
    this.date = p.date;
    this.photoUrl = p.photoUrl;
    this.grad = p.grad;
    this.sortOrder = p.sortOrder;
    this.isActive = p.isActive;
  }
}
