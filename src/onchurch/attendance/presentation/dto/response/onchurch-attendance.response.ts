import { ApiProperty } from '@nestjs/swagger';
import { OnchurchAttendanceSessionCount } from '@/onchurch/attendance/domain/repository/onchurch-attendance.repository.interface';

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
