import { ApiProperty } from '@nestjs/swagger';
import { OnchurchTransportation } from '@/onchurch/transportation/domain/entity/onchurch-transportation.entity';

export class OnchurchTransportationResponse {
  @ApiProperty({ type: Number, required: true })
  id: number;

  @ApiProperty({ type: String, required: false, nullable: true })
  icon: string | null;

  @ApiProperty({ type: String, required: true })
  tag: string;

  @ApiProperty({ type: String, required: true })
  title: string;

  @ApiProperty({ type: String, required: false, nullable: true })
  description: string | null;

  @ApiProperty({ type: Number, required: true })
  sortOrder: number;

  @ApiProperty({ type: Boolean, required: true })
  isActive: boolean;

  constructor(entity: OnchurchTransportation) {
    this.id = entity.id;
    this.icon = entity.icon;
    this.tag = entity.tag;
    this.title = entity.title;
    this.description = entity.description;
    this.sortOrder = entity.sortOrder;
    this.isActive = entity.isActive;
  }
}

export class OnchurchTransportationListResponse {
  @ApiProperty({ type: [OnchurchTransportationResponse], required: true })
  transportations: OnchurchTransportationResponse[];

  constructor(items: OnchurchTransportation[]) {
    this.transportations = items.map(t => new OnchurchTransportationResponse(t));
  }
}
