import { OnchurchEmailFailure, OnchurchEmailLog } from '@/onchurch/master/domain/entity/onchurch-email-log.entity';
import { PagingItems } from '@/common/type/type';

export const ONCHURCH_EMAIL_LOG_REPOSITORY = Symbol('ONCHURCH_EMAIL_LOG_REPOSITORY');

export interface IOnchurchEmailLogRepository {
  create(params: {
    senderId: number;
    senderName: string;
    subject: string;
    content: string;
    recipients: string[];
    total: number;
    sent: number;
    failed: number;
    failures: OnchurchEmailFailure[];
  }): Promise<number>;
  findPage(params: { keyword: string | null; page: number; size: number }): Promise<PagingItems<OnchurchEmailLog>>;
}
