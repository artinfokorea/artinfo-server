import { ApiProperty } from '@nestjs/swagger';
import { AzeyoSchedule } from '@/azeyo/schedule/domain/entity/azeyo-schedule.entity';
import { AzeyoScheduleTag } from '@/azeyo/schedule/domain/entity/azeyo-schedule-tag.entity';

export class AzeyoScheduleTagResponse {
  @ApiProperty() id: number;
  @ApiProperty() name: string;
  @ApiProperty() color: string;
  @ApiProperty() isSystem: boolean;

  constructor(tag: AzeyoScheduleTag) {
    this.id = tag.id;
    this.name = tag.name;
    this.color = tag.color;
    this.isSystem = tag.isSystem;
  }
}

export class AzeyoScheduleResponse {
  @ApiProperty() id: number;
  @ApiProperty() title: string;
  @ApiProperty() date: string;
  @ApiProperty() memo: string | null;
  @ApiProperty({ type: [AzeyoScheduleTagResponse] }) tags: AzeyoScheduleTagResponse[];
  @ApiProperty() createdAt: Date;

  constructor(schedule: AzeyoSchedule) {
    this.id = schedule.id;
    this.title = schedule.title;
    this.date = schedule.date;
    this.memo = schedule.memo;
    this.tags = (schedule.tags ?? []).map(t => new AzeyoScheduleTagResponse(t));
    this.createdAt = schedule.createdAt;
  }
}

export class AzeyoSchedulesResponse {
  @ApiProperty({ type: [AzeyoScheduleResponse] }) schedules: AzeyoScheduleResponse[];

  constructor(items: AzeyoSchedule[]) {
    this.schedules = items.map(s => new AzeyoScheduleResponse(s));
  }
}

export class AzeyoScheduleTagsResponse {
  @ApiProperty({ type: [AzeyoScheduleTagResponse] }) tags: AzeyoScheduleTagResponse[];

  constructor(items: AzeyoScheduleTag[]) {
    this.tags = items.map(t => new AzeyoScheduleTagResponse(t));
  }
}
