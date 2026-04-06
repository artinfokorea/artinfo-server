import { AzeyoCommunityReport } from '@/azeyo/community/domain/entity/azeyo-community-report.entity';

export const AZEYO_COMMUNITY_REPORT_REPOSITORY = Symbol('AZEYO_COMMUNITY_REPORT_REPOSITORY');

export interface IAzeyoCommunityReportRepository {
  findByPostIdAndUserId(postId: number, userId: number): Promise<AzeyoCommunityReport | null>;
  save(report: Partial<AzeyoCommunityReport>): Promise<AzeyoCommunityReport>;
}
