export class OnchurchNoticeCategoryWriteCommand {
  name: string;
  sortOrder: number;
  isActive: boolean;

  constructor(p: { name: string; sortOrder: number; isActive: boolean }) {
    this.name = p.name;
    this.sortOrder = p.sortOrder;
    this.isActive = p.isActive;
  }
}
