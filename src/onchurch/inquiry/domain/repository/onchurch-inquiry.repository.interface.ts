import { OnchurchInquiry } from '@/onchurch/inquiry/domain/entity/onchurch-inquiry.entity';

export const ONCHURCH_INQUIRY_REPOSITORY = Symbol('ONCHURCH_INQUIRY_REPOSITORY');

export interface IOnchurchInquiryRepository {
  create(userId: number, question: string): Promise<OnchurchInquiry>;
  findAllByUserId(userId: number): Promise<OnchurchInquiry[]>;
}
