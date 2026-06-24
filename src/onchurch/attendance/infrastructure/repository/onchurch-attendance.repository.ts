import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IOnchurchAttendanceRepository,
  OnchurchAttendanceDateCount,
  OnchurchAttendanceSaintCount,
  OnchurchAttendanceServiceStat,
  OnchurchAttendanceSessionCount,
} from '@/onchurch/attendance/domain/repository/onchurch-attendance.repository.interface';
import { OnchurchAttendance } from '@/onchurch/attendance/domain/entity/onchurch-attendance.entity';

@Injectable()
export class OnchurchAttendanceRepository implements IOnchurchAttendanceRepository {
  constructor(
    @InjectRepository(OnchurchAttendance)
    private readonly repo: Repository<OnchurchAttendance>,
  ) {}

  async findPresentSaintIds(churchId: number, date: string, serviceType: string): Promise<number[]> {
    const rows = await this.repo.find({ where: { churchId, date, serviceType } });
    return rows.map((r) => r.saintId);
  }

  async findOne(churchId: number, saintId: number, date: string, serviceType: string): Promise<OnchurchAttendance | null> {
    return this.repo.findOneBy({ churchId, saintId, date, serviceType });
  }

  async create(churchId: number, saintId: number, date: string, serviceType: string): Promise<OnchurchAttendance> {
    return this.repo.save({ churchId, saintId, date, serviceType });
  }

  async removeById(churchId: number, id: number): Promise<void> {
    const v = await this.repo.findOneBy({ id, churchId });
    if (v) await this.repo.softRemove(v);
  }

  async listSessions(churchId: number): Promise<OnchurchAttendanceSessionCount[]> {
    const rows = await this.repo
      .createQueryBuilder('a')
      .select('a.date', 'date')
      .addSelect('a.serviceType', 'serviceType')
      .addSelect('COUNT(DISTINCT a.saint_id)', 'count')
      .where('a.churchId = :churchId', { churchId })
      .andWhere('a.deletedAt IS NULL')
      .groupBy('a.date')
      .addGroupBy('a.serviceType')
      .orderBy('a.date', 'DESC')
      .addOrderBy('a.serviceType', 'ASC')
      .limit(60)
      .getRawMany<{ date: string; serviceType: string; count: string }>();
    return rows.map((r) => ({ date: r.date, serviceType: r.serviceType, count: Number(r.count) }));
  }

  async trendByDate(churchId: number, fromDate: string): Promise<OnchurchAttendanceDateCount[]> {
    const rows = await this.repo
      .createQueryBuilder('a')
      .select('a.date', 'date')
      .addSelect('COUNT(DISTINCT a.saint_id)', 'count')
      .where('a.churchId = :churchId', { churchId })
      .andWhere('a.deletedAt IS NULL')
      .andWhere('a.date >= :fromDate', { fromDate })
      .groupBy('a.date')
      .orderBy('a.date', 'ASC')
      .getRawMany<{ date: string; count: string }>();
    return rows.map((r) => ({ date: r.date, count: Number(r.count) }));
  }

  async statsByService(churchId: number, fromDate: string): Promise<OnchurchAttendanceServiceStat[]> {
    const rows = await this.repo
      .createQueryBuilder('a')
      .select('a.serviceType', 'serviceType')
      .addSelect('COUNT(*)', 'total')
      .addSelect('COUNT(DISTINCT a.date)', 'occurrences')
      .where('a.churchId = :churchId', { churchId })
      .andWhere('a.deletedAt IS NULL')
      .andWhere('a.date >= :fromDate', { fromDate })
      .groupBy('a.serviceType')
      .orderBy('total', 'DESC')
      .getRawMany<{ serviceType: string; total: string; occurrences: string }>();
    return rows.map((r) => ({ serviceType: r.serviceType, total: Number(r.total), occurrences: Number(r.occurrences) }));
  }

  async countBySaint(churchId: number, fromDate: string): Promise<OnchurchAttendanceSaintCount[]> {
    const rows = await this.repo
      .createQueryBuilder('a')
      .select('a.saintId', 'saintId')
      .addSelect('COUNT(DISTINCT a.date)', 'count')
      .where('a.churchId = :churchId', { churchId })
      .andWhere('a.deletedAt IS NULL')
      .andWhere('a.date >= :fromDate', { fromDate })
      .groupBy('a.saintId')
      .getRawMany<{ saintId: string; count: string }>();
    return rows.map((r) => ({ saintId: Number(r.saintId), count: Number(r.count) }));
  }

  async countDistinctDates(churchId: number, fromDate: string): Promise<number> {
    const row = await this.repo
      .createQueryBuilder('a')
      .select('COUNT(DISTINCT a.date)', 'c')
      .where('a.churchId = :churchId', { churchId })
      .andWhere('a.deletedAt IS NULL')
      .andWhere('a.date >= :fromDate', { fromDate })
      .getRawOne<{ c: string }>();
    return Number(row?.c ?? 0);
  }
}
