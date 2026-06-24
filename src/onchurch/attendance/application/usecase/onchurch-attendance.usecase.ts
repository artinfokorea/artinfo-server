import { Inject, Injectable } from '@nestjs/common';
import {
  ONCHURCH_ATTENDANCE_REPOSITORY,
  IOnchurchAttendanceRepository,
  OnchurchAttendanceDateCount,
  OnchurchAttendanceSaintCount,
  OnchurchAttendanceServiceStat,
  OnchurchAttendanceSessionCount,
} from '@/onchurch/attendance/domain/repository/onchurch-attendance.repository.interface';
import { OnchurchChurchManagerResolver } from '@/onchurch/church/application/service/onchurch-church-manager.resolver';
import { OnchurchAttendanceMarkCommand } from '@/onchurch/attendance/application/command/onchurch-attendance-mark.command';
import { OnchurchAttendanceChurchNotConfigured } from '@/onchurch/attendance/domain/exception/onchurch-attendance.exception';

@Injectable()
export class OnchurchGetAttendanceSessionUseCase {
  constructor(
    @Inject(ONCHURCH_ATTENDANCE_REPOSITORY) private readonly repo: IOnchurchAttendanceRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}
  async execute(userId: number, date: string, serviceType: string): Promise<number[]> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) return [];
    return this.repo.findPresentSaintIds(church.id, date, serviceType);
  }
}

@Injectable()
export class OnchurchMarkAttendanceUseCase {
  constructor(
    @Inject(ONCHURCH_ATTENDANCE_REPOSITORY) private readonly repo: IOnchurchAttendanceRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}
  async execute(userId: number, command: OnchurchAttendanceMarkCommand): Promise<void> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) throw new OnchurchAttendanceChurchNotConfigured();

    const existing = await this.repo.findOne(church.id, command.saintId, command.date, command.serviceType);
    if (command.present) {
      if (!existing) await this.repo.create(church.id, command.saintId, command.date, command.serviceType);
    } else if (existing) {
      await this.repo.removeById(church.id, existing.id);
    }
  }
}

export interface OnchurchAttendanceStatsView {
  weeks: number;
  windowDates: number;
  trend: OnchurchAttendanceDateCount[];
  byService: OnchurchAttendanceServiceStat[];
  perSaint: OnchurchAttendanceSaintCount[];
}

function cutoffDate(weeks: number): string {
  const d = new Date();
  d.setDate(d.getDate() - weeks * 7);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

@Injectable()
export class OnchurchGetAttendanceStatsUseCase {
  constructor(
    @Inject(ONCHURCH_ATTENDANCE_REPOSITORY) private readonly repo: IOnchurchAttendanceRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}
  async execute(userId: number, weeksRaw: number): Promise<OnchurchAttendanceStatsView> {
    const weeks = Math.min(52, Math.max(1, Math.floor(weeksRaw) || 4));
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) return { weeks, windowDates: 0, trend: [], byService: [], perSaint: [] };

    // 추이 차트는 최소 12주를 보여주고, 결석/출석률 집계는 선택한 weeks 창을 사용한다.
    const trendFrom = cutoffDate(Math.max(weeks, 12));
    const windowFrom = cutoffDate(weeks);

    const [trend, byService, perSaint, windowDates] = await Promise.all([
      this.repo.trendByDate(church.id, trendFrom),
      this.repo.statsByService(church.id, windowFrom),
      this.repo.countBySaint(church.id, windowFrom),
      this.repo.countDistinctDates(church.id, windowFrom),
    ]);

    return { weeks, windowDates, trend, byService, perSaint };
  }
}

@Injectable()
export class OnchurchListAttendanceSessionsUseCase {
  constructor(
    @Inject(ONCHURCH_ATTENDANCE_REPOSITORY) private readonly repo: IOnchurchAttendanceRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}
  async execute(userId: number): Promise<OnchurchAttendanceSessionCount[]> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) return [];
    return this.repo.listSessions(church.id);
  }
}
