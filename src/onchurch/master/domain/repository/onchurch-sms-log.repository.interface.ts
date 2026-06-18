import { OnchurchSmsLog, OnchurchSmsRecipientResult } from '@/onchurch/master/domain/entity/onchurch-sms-log.entity';
import { PagingItems } from '@/common/type/type';

export const ONCHURCH_SMS_LOG_REPOSITORY = Symbol('ONCHURCH_SMS_LOG_REPOSITORY');

export interface IOnchurchSmsLogRepository {
  create(params: {
    senderId: number;
    senderName: string;
    subject: string;
    content: string;
    results: OnchurchSmsRecipientResult[];
    total: number;
    sent: number;
    failed: number;
    excluded: number;
  }): Promise<number>;
  findPage(params: { keyword: string | null; page: number; size: number }): Promise<PagingItems<OnchurchSmsLog>>;
}
