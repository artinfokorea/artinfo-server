import { OngiInquiry, OngiInquiryCreator } from '@/ongi/inquiry/domain/entity/ongi-inquiry.entity';

export const ONGI_INQUIRY_REPOSITORY = Symbol('ONGI_INQUIRY_REPOSITORY');

export interface IOngiInquiryRepository {
  create(creator: OngiInquiryCreator): Promise<OngiInquiry>;
  /** 내 문의 (최근 순) */
  scanByUserId(userId: number): Promise<OngiInquiry[]>;
}
