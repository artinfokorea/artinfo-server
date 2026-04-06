import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AzeyoCommunityReport } from '@/azeyo/community/domain/entity/azeyo-community-report.entity';
import { IAzeyoCommunityReportRepository } from '@/azeyo/community/domain/repository/azeyo-community-report.repository.interface';

@Injectable()
export class AzeyoCommunityReportRepository implements IAzeyoCommunityReportRepository {
  constructor(
    @InjectRepository(AzeyoCommunityReport)
    private readonly repository: Repository<AzeyoCommunityReport>,
  ) {}

  async findByPostIdAndUserId(postId: number, userId: number): Promise<AzeyoCommunityReport | null> {
    return this.repository.findOneBy({ postId, userId });
  }

  async save(report: Partial<AzeyoCommunityReport>): Promise<AzeyoCommunityReport> {
    const entity = this.repository.create(report);
    return this.repository.save(entity);
  }
}
