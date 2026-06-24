import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IOnchurchAttendanceRepository,
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
}
