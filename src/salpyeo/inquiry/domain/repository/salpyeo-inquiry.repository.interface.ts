import { SalpyeoInquiry, SalpyeoInquiryCreator } from '@/salpyeo/inquiry/domain/entity/salpyeo-inquiry.entity';

export const SALPYEO_INQUIRY_REPOSITORY = Symbol('SALPYEO_INQUIRY_REPOSITORY');

export interface ISalpyeoInquiryRepository {
  create(creator: SalpyeoInquiryCreator): Promise<SalpyeoInquiry>;
  /** 최근 접수가 먼저 */
  scan(limit: number): Promise<SalpyeoInquiry[]>;
  setResolved(id: number, isResolved: boolean): Promise<SalpyeoInquiry>;
}
