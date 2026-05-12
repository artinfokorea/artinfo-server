import { ApiProperty } from '@nestjs/swagger';
import { OnchurchWorshipService, OnchurchWorshipServiceTag } from '@/onchurch/worship/domain/entity/onchurch-worship-service.entity';
import { OnchurchWorshipOrder } from '@/onchurch/worship/domain/entity/onchurch-worship-order.entity';
import { PublicWorshipView } from '@/onchurch/worship/application/usecase/onchurch-list-public-worship.usecase';

export class OnchurchWorshipServiceResponse {
  @ApiProperty({ type: Number }) id: number;
  @ApiProperty({ enum: ['WEEK', 'DAILY'] }) tag: OnchurchWorshipServiceTag;
  @ApiProperty({ type: String }) name: string;
  @ApiProperty({ type: String }) time: string;
  @ApiProperty({ type: String, nullable: true }) meta: string | null;
  @ApiProperty({ type: Boolean }) isFeatured: boolean;
  @ApiProperty({ type: Number }) sortOrder: number;
  @ApiProperty({ type: Boolean }) isActive: boolean;

  constructor(s: OnchurchWorshipService) {
    this.id = s.id;
    this.tag = s.tag;
    this.name = s.name;
    this.time = s.time;
    this.meta = s.meta;
    this.isFeatured = s.isFeatured;
    this.sortOrder = s.sortOrder;
    this.isActive = s.isActive;
  }
}

export class OnchurchWorshipOrderResponse {
  @ApiProperty({ type: Number }) id: number;
  @ApiProperty({ type: String }) no: string;
  @ApiProperty({ type: String }) item: string;
  @ApiProperty({ type: String, nullable: true }) leader: string | null;
  @ApiProperty({ type: Number }) sortOrder: number;
  @ApiProperty({ type: Boolean }) isActive: boolean;

  constructor(o: OnchurchWorshipOrder) {
    this.id = o.id;
    this.no = o.no;
    this.item = o.item;
    this.leader = o.leader;
    this.sortOrder = o.sortOrder;
    this.isActive = o.isActive;
  }
}

export class OnchurchWorshipServiceListResponse {
  @ApiProperty({ type: [OnchurchWorshipServiceResponse] })
  services: OnchurchWorshipServiceResponse[];
  constructor(items: OnchurchWorshipService[]) {
    this.services = items.map(s => new OnchurchWorshipServiceResponse(s));
  }
}

export class OnchurchWorshipOrderListResponse {
  @ApiProperty({ type: [OnchurchWorshipOrderResponse] })
  orders: OnchurchWorshipOrderResponse[];
  constructor(items: OnchurchWorshipOrder[]) {
    this.orders = items.map(o => new OnchurchWorshipOrderResponse(o));
  }
}

export class OnchurchPublicWorshipResponse {
  @ApiProperty({ type: [OnchurchWorshipServiceResponse] })
  services: OnchurchWorshipServiceResponse[];

  @ApiProperty({ type: [OnchurchWorshipOrderResponse] })
  orders: OnchurchWorshipOrderResponse[];

  constructor(view: PublicWorshipView) {
    this.services = view.services.map(s => new OnchurchWorshipServiceResponse(s));
    this.orders = view.orders.map(o => new OnchurchWorshipOrderResponse(o));
  }
}
