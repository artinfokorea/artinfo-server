import { ApiProperty } from '@nestjs/swagger';
import { OnchurchAttendanceSessionCount } from '@/onchurch/attendance/domain/repository/onchurch-attendance.repository.interface';
import { OnchurchAttendanceStatsView } from '@/onchurch/attendance/application/usecase/onchurch-attendance.usecase';

export class OnchurchAttendanceSessionResponse {
  @ApiProperty({ type: [Number], description: '해당 세션 출석 성도 ID 목록' })
  saintIds: number[];

  constructor(saintIds: number[]) {
    this.saintIds = saintIds;
  }
}

export class OnchurchAttendanceSessionCountResponse {
  @ApiProperty({ type: String }) date: string;
  @ApiProperty({ type: String }) serviceType: string;
  @ApiProperty({ type: Number }) count: number;

  constructor(s: OnchurchAttendanceSessionCount) {
    this.date = s.date;
    this.serviceType = s.serviceType;
    this.count = s.count;
  }
}

export class OnchurchAttendanceSessionListResponse {
  @ApiProperty({ type: [OnchurchAttendanceSessionCountResponse] })
  sessions: OnchurchAttendanceSessionCountResponse[];

  constructor(items: OnchurchAttendanceSessionCount[]) {
    this.sessions = items.map((s) => new OnchurchAttendanceSessionCountResponse(s));
  }
}

class OnchurchAttendanceTrendPoint {
  @ApiProperty({ type: String }) date: string;
  @ApiProperty({ type: Number }) count: number;
}

class OnchurchAttendanceServiceStatItem {
  @ApiProperty({ type: String }) serviceType: string;
  @ApiProperty({ type: Number }) occurrences: number;
  @ApiProperty({ type: Number }) total: number;
}

class OnchurchAttendanceSaintCountItem {
  @ApiProperty({ type: Number }) saintId: number;
  @ApiProperty({ type: Number }) count: number;
}

export class OnchurchAttendanceStatsResponse {
  @ApiProperty({ type: Number }) weeks: number;
  @ApiProperty({ type: Number, description: '집계 기간 내 출석이 있었던 예배일 수' }) windowDates: number;
  @ApiProperty({ type: [OnchurchAttendanceTrendPoint] }) trend: OnchurchAttendanceTrendPoint[];
  @ApiProperty({ type: [OnchurchAttendanceServiceStatItem] }) byService: OnchurchAttendanceServiceStatItem[];
  @ApiProperty({ type: [OnchurchAttendanceSaintCountItem] }) perSaint: OnchurchAttendanceSaintCountItem[];

  constructor(v: OnchurchAttendanceStatsView) {
    this.weeks = v.weeks;
    this.windowDates = v.windowDates;
    this.trend = v.trend.map((t) => ({ date: t.date, count: t.count }));
    this.byService = v.byService.map((s) => ({ serviceType: s.serviceType, occurrences: s.occurrences, total: s.total }));
    this.perSaint = v.perSaint.map((p) => ({ saintId: p.saintId, count: p.count }));
  }
}
