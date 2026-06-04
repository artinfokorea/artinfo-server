export class OnchurchCommunityCategoryWriteCommand {
  name: string;
  sortOrder: number;
  isActive: boolean;

  constructor(params: { name: string; sortOrder: number; isActive: boolean }) {
    this.name = params.name;
    this.sortOrder = params.sortOrder;
    this.isActive = params.isActive;
  }
}
