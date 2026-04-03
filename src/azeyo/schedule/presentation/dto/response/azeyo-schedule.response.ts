import { ApiProperty } from '@nestjs/swagger';
import { AzeyoSchedule, AZEYO_SCHEDULE_REPEAT_TYPE } from '@/azeyo/schedule/domain/entity/azeyo-schedule.entity';
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
  @ApiProperty() repeatType: AZEYO_SCHEDULE_REPEAT_TYPE;
  @ApiProperty() startDate: string | null;
  @ApiProperty() anniversaryLabel: string | null;
  @ApiProperty({ type: [AzeyoScheduleTagResponse] }) tags: AzeyoScheduleTagResponse[];
  @ApiProperty() createdAt: Date;

  constructor(schedule: AzeyoSchedule) {
    this.id = schedule.id;
    this.title = schedule.title;
    this.date = schedule.date;
    this.memo = schedule.memo;
    this.repeatType = schedule.repeatType ?? AZEYO_SCHEDULE_REPEAT_TYPE.NONE;
    this.startDate = schedule.startDate ?? null;
    this.anniversaryLabel = this.computeAnniversaryLabel(schedule);
    this.tags = (schedule.tags ?? []).map(t => new AzeyoScheduleTagResponse(t));
    this.createdAt = schedule.createdAt;
  }

  private computeAnniversaryLabel(schedule: AzeyoSchedule): string | null {
    if (schedule.repeatType !== AZEYO_SCHEDULE_REPEAT_TYPE.YEARLY || !schedule.startDate) return null;

    const start = new Date(schedule.startDate);
    const target = new Date(schedule.date);
    const years = target.getFullYear() - start.getFullYear();

    if (years > 0) return `${years}주년`;

    const diffMs = target.getTime() - start.getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (days > 0) return `${days}일째`;

    return null;
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
