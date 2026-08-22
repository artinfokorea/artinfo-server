import { OngiReport, OngiReportCreator } from '@/ongi/report/domain/entity/ongi-report.entity';

export const ONGI_REPORT_REPOSITORY = Symbol('ONGI_REPORT_REPOSITORY');

export interface IOngiReportRepository {
  create(creator: OngiReportCreator): Promise<OngiReport>;
}
