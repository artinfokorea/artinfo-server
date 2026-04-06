import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AzeyoUserReport } from '@/azeyo/user/domain/entity/azeyo-user-report.entity';
import { IAzeyoUserReportRepository } from '@/azeyo/user/domain/repository/azeyo-user-report.repository.interface';

@Injectable()
export class AzeyoUserReportRepository implements IAzeyoUserReportRepository {
  constructor(
    @InjectRepository(AzeyoUserReport)
    private readonly repository: Repository<AzeyoUserReport>,
  ) {}

  async findByTargetIdAndReporterId(targetId: number, reporterId: number): Promise<AzeyoUserReport | null> {
    return this.repository.findOneBy({ targetId, reporterId });
  }

  async save(report: Partial<AzeyoUserReport>): Promise<AzeyoUserReport> {
    const entity = this.repository.create(report);
    return this.repository.save(entity);
  }
}
