import { OnchurchEmailLog, OnchurchEmailRecipientResult } from '@/onchurch/master/domain/entity/onchurch-email-log.entity';
import { PagingItems } from '@/common/type/type';

export const ONCHURCH_EMAIL_LOG_REPOSITORY = Symbol('ONCHURCH_EMAIL_LOG_REPOSITORY');

export interface IOnchurchEmailLogRepository {
  // 발송 시작 시점에 빈 로그를 먼저 만든다. (status='processing', 카운터 0, results=[])
  // 워커가 수신자별 결과를 recordResult로 누적한다.
  createPending(params: {
    senderId: number;
    senderName: string;
    subject: string;
    content: string;
    total: number;
  }): Promise<number>;

  // 수신자 1명의 결과를 원자적으로 누적한다(카운터 +1, results 배열에 append).
  // 누적 후 sent+failed+excluded >= total 이면 status를 completed로 바꾸고 completed:true 반환.
  recordResult(id: number, result: OnchurchEmailRecipientResult): Promise<{ completed: boolean }>;

  findById(id: number): Promise<OnchurchEmailLog | null>;

  findPage(params: { keyword: string | null; page: number; size: number }): Promise<PagingItems<OnchurchEmailLog>>;
}
