import { ApiProperty } from '@nestjs/swagger';
import { OnchurchEvent } from '@/onchurch/event/domain/entity/onchurch-event.entity';

export class OnchurchEventResponse {
  @ApiProperty({ type: Number, required: true })
  id: number;

  @ApiProperty({ type: String, required: true })
  title: string;

  @ApiProperty({ type: String, required: false, nullable: true })
  description: string | null;

  @ApiProperty({ type: String, required: false, nullable: true })
  location: string | null;

  @ApiProperty({ type: String, required: true })
  startAt: string;

  @ApiProperty({ type: String, required: false, nullable: true })
  endAt: string | null;

  @ApiProperty({ type: Boolean, required: true })
  isAllDay: boolean;

  constructor(event: OnchurchEvent) {
    this.id = event.id;
    this.title = event.title;
    this.description = event.description;
    this.location = event.location;
    this.startAt = event.startAt.toISOString();
    this.endAt = event.endAt ? event.endAt.toISOString() : null;
    this.isAllDay = event.isAllDay;
  }
}

export class OnchurchEventListResponse {
  @ApiProperty({ type: [OnchurchEventResponse], required: true })
  events: OnchurchEventResponse[];

  constructor(events: OnchurchEvent[]) {
    this.events = events.map(e => new OnchurchEventResponse(e));
  }
}
