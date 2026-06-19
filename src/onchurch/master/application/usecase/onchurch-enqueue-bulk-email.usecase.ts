import { BadRequestException, ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  IOnchurchUserRepository,
  ONCHURCH_USER_REPOSITORY,
} from '@/onchurch/user/domain/repository/onchurch-user.repository.interface';
import { ONCHURCH_USER_ROLE } from '@/onchurch/user/domain/entity/onchurch-user.entity';
import {
  IOnchurchEmailLogRepository,
  ONCHURCH_EMAIL_LOG_REPOSITORY,
} from '@/onchurch/master/domain/repository/onchurch-email-log.repository.interface';
import {
  ONCHURCH_BULK_EMAIL_QUEUE,
  OnchurchBulkEmailJob,
} from '@/onchurch/master/application/queue/onchurch-bulk-email.queue';

export type EnqueueBulkEmailResult = { logId: number; total: number };

/**
 * 대량 메일 발송 요청을 큐에 적재한다.
 *  - HTTP 요청에서는 검증·발송을 하지 않고 즉시 반환한다(수신자 수와 무관하게 빠름).
 *  - 발송 로그를 먼저 생성(status=processing)하고 수신자 1명당 1개의 job을 적재한다.
 *  - 실제 검증·발송·결과 누적은 워커(OnchurchBulkEmailProcessor)가 처리한다.
 */
@Injectable()
export class OnchurchEnqueueBulkEmailUseCase {
  constructor(
    @Inject(ONCHURCH_USER_REPOSITORY)
    private readonly userRepository: IOnchurchUserRepository,
    @Inject(ONCHURCH_EMAIL_LOG_REPOSITORY)
    private readonly emailLogRepository: IOnchurchEmailLogRepository,
    @InjectQueue(ONCHURCH_BULK_EMAIL_QUEUE)
    private readonly queue: Queue<OnchurchBulkEmailJob>,
  ) {}

  async execute(userId: number, params: { subject: string; content: string; recipients: string[] }): Promise<EnqueueBulkEmailResult> {
    const user = await this.userRepository.findOneOrThrowById(userId);
    if (user.role !== ONCHURCH_USER_ROLE.MASTER) {
      throw new ForbiddenException('마스터 권한이 필요합니다.');
    }

    // 정규화 + 중복 제거
    const seen = new Set<string>();
    const candidates: string[] = [];
    for (const raw of params.recipients) {
      const email = (raw ?? '').trim().toLowerCase();
      if (!email || seen.has(email)) continue;
      seen.add(email);
      candidates.push(email);
    }
    if (candidates.length === 0) {
      throw new BadRequestException('유효한 수신자가 없습니다.');
    }

    // 발송 로그 먼저 생성 — 본문(content)은 워커가 logId로 조회해 렌더링한다.
    const logId = await this.emailLogRepository.createPending({
      senderId: user.id,
      senderName: user.name,
      subject: params.subject,
      content: params.content,
      total: candidates.length,
    });

    // 수신자 1명당 1개의 job. attempts/backoff로 일시 오류(SES throttle 등) 재시도.
    await this.queue.addBulk(
      candidates.map((email) => ({
        name: 'send',
        data: { logId, email, subject: params.subject },
        opts: {
          attempts: 3,
          backoff: { type: 'exponential', delay: 3000 },
          removeOnComplete: true,
          removeOnFail: 1000,
        },
      })),
    );

    return { logId, total: candidates.length };
  }
}
