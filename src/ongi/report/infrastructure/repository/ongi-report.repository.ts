import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IOngiReportRepository } from '@/ongi/report/domain/repository/ongi-report.repository.interface';
import { OngiReport, OngiReportCreator } from '@/ongi/report/domain/entity/ongi-report.entity';

@Injectable()
export class OngiReportRepository implements IOngiReportRepository {
  constructor(
    @InjectRepository(OngiReport)
    private readonly reportRepository: Repository<OngiReport>,
  ) {}

  async create(creator: OngiReportCreator): Promise<OngiReport> {
    return this.reportRepository.save({
      reporterUserId: creator.reporterUserId,
      targetType: creator.targetType,
      targetId: creator.targetId,
      reason: creator.reason,
    });
  }
}
