import { OnchurchAttendance } from '@/onchurch/attendance/domain/entity/onchurch-attendance.entity';

export const ONCHURCH_ATTENDANCE_REPOSITORY = Symbol('ONCHURCH_ATTENDANCE_REPOSITORY');

export interface OnchurchAttendanceSessionCount {
  date: string;
  serviceType: string;
  count: number;
}

export interface OnchurchAttendanceDateCount {
  date: string;
  count: number;
}

export interface OnchurchAttendanceServiceStat {
  serviceType: string;
  occurrences: number;
  total: number;
}

export interface OnchurchAttendanceSaintCount {
  saintId: number;
  count: number;
}

export interface IOnchurchAttendanceRepository {
  findPresentSaintIds(churchId: number, date: string, serviceType: string): Promise<number[]>;
  findOne(churchId: number, saintId: number, date: string, serviceType: string): Promise<OnchurchAttendance | null>;
  create(churchId: number, saintId: number, date: string, serviceType: string): Promise<OnchurchAttendance>;
  removeById(churchId: number, id: number): Promise<void>;
  softRemoveByServiceType(churchId: number, serviceType: string): Promise<number>;
  listSessions(churchId: number): Promise<OnchurchAttendanceSessionCount[]>;
  trendByDate(churchId: number, fromDate: string): Promise<OnchurchAttendanceDateCount[]>;
  statsByService(churchId: number, fromDate: string): Promise<OnchurchAttendanceServiceStat[]>;
  countBySaint(churchId: number, fromDate: string): Promise<OnchurchAttendanceSaintCount[]>;
  countDistinctDates(churchId: number, fromDate: string): Promise<number>;
}
