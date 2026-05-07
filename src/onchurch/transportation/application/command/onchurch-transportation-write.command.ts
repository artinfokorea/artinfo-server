export class OnchurchTransportationWriteCommand {
  icon: string | null;
  tag: string;
  title: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;

  constructor(params: {
    icon: string | null;
    tag: string;
    title: string;
    description: string | null;
    sortOrder: number;
    isActive: boolean;
  }) {
    this.icon = params.icon;
    this.tag = params.tag;
    this.title = params.title;
    this.description = params.description;
    this.sortOrder = params.sortOrder;
    this.isActive = params.isActive;
  }
}
