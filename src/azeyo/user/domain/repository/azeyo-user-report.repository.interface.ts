import { AzeyoUserReport } from '@/azeyo/user/domain/entity/azeyo-user-report.entity';

export const AZEYO_USER_REPORT_REPOSITORY = Symbol('AZEYO_USER_REPORT_REPOSITORY');

export interface IAzeyoUserReportRepository {
  findByTargetIdAndReporterId(targetId: number, reporterId: number): Promise<AzeyoUserReport | null>;
  save(report: Partial<AzeyoUserReport>): Promise<AzeyoUserReport>;
}
