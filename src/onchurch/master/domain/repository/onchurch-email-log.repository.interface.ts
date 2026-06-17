import { OnchurchEmailFailure, OnchurchEmailLog } from '@/onchurch/master/domain/entity/onchurch-email-log.entity';

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
  findAll(): Promise<OnchurchEmailLog[]>;
}
