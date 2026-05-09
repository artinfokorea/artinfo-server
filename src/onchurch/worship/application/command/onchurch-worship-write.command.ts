import { OnchurchWorshipServiceTag } from '@/onchurch/worship/domain/entity/onchurch-worship-service.entity';

export class OnchurchWorshipServiceWriteCommand {
  tag: OnchurchWorshipServiceTag;
  name: string;
  time: string;
  meta: string | null;
  isFeatured: boolean;
  sortOrder: number;
  isActive: boolean;

  constructor(p: {
    tag: OnchurchWorshipServiceTag;
    name: string;
    time: string;
    meta: string | null;
    isFeatured: boolean;
    sortOrder: number;
    isActive: boolean;
  }) {
    this.tag = p.tag;
    this.name = p.name;
    this.time = p.time;
    this.meta = p.meta;
    this.isFeatured = p.isFeatured;
    this.sortOrder = p.sortOrder;
    this.isActive = p.isActive;
  }
}

export class OnchurchWorshipOrderWriteCommand {
  no: string;
  item: string;
  leader: string | null;
  sortOrder: number;
  isActive: boolean;

  constructor(p: { no: string; item: string; leader: string | null; sortOrder: number; isActive: boolean }) {
    this.no = p.no;
    this.item = p.item;
    this.leader = p.leader;
    this.sortOrder = p.sortOrder;
    this.isActive = p.isActive;
  }
}
