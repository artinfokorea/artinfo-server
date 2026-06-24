import { OnchurchAttendance } from '@/onchurch/attendance/domain/entity/onchurch-attendance.entity';

export const ONCHURCH_ATTENDANCE_REPOSITORY = Symbol('ONCHURCH_ATTENDANCE_REPOSITORY');

export interface OnchurchAttendanceSessionCount {
  date: string;
  serviceType: string;
  count: number;
}

export interface IOnchurchAttendanceRepository {
  findPresentSaintIds(churchId: number, date: string, serviceType: string): Promise<number[]>;
  findOne(churchId: number, saintId: number, date: string, serviceType: string): Promise<OnchurchAttendance | null>;
  create(churchId: number, saintId: number, date: string, serviceType: string): Promise<OnchurchAttendance>;
  removeById(churchId: number, id: number): Promise<void>;
  listSessions(churchId: number): Promise<OnchurchAttendanceSessionCount[]>;
}
