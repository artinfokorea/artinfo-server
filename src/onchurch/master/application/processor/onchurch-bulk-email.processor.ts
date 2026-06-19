import { Inject, Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { AwsSesService } from '@/aws/ses/aws-ses.service';
import { OnchurchEmailVerificationService } from '@/onchurch/master/application/service/onchurch-email-verification.service';
import {
  IOnchurchEmailLogRepository,
  ONCHURCH_EMAIL_LOG_REPOSITORY,
} from '@/onchurch/master/domain/repository/onchurch-email-log.repository.interface';
import {
  ONCHURCH_BULK_EMAIL_MAIL_FROM,
  ONCHURCH_BULK_EMAIL_QUEUE,
  OnchurchBulkEmailJob,
} from '@/onchurch/master/application/queue/onchurch-bulk-email.queue';

// 동시 발송 수 / 초당 발송 상한 — SES 전송 한도에 맞춰 환경변수로 조절.
const CONCURRENCY = parseInt(process.env['SES_SEND_CONCURRENCY'] ?? '10', 10);
const MAX_PER_SEC = parseInt(process.env['SES_SEND_MAX_PER_SEC'] ?? '14', 10);

/**
 * 대량 메일 발송 워커. 수신자 1명 = 1 job.
 *  - BullMQ concurrency로 동시성, limiter로 초당 발송량(SES rate)을 제어한다.
 *  - 일시 오류(throttle/네트워크/5xx)는 BullMQ attempts로 재시도, 마지막 시도까지 실패하거나
 *    영구 오류면 failed로 기록한다. 결과는 logId 행에 원자적으로 누적된다.
 */
@Processor(ONCHURCH_BULK_EMAIL_QUEUE, {
  concurrency: CONCURRENCY,
  limiter: { max: MAX_PER_SEC, duration: 1000 },
})
export class OnchurchBulkEmailProcessor extends WorkerHost {
  private readonly logger = new Logger(OnchurchBulkEmailProcessor.name);

  // 같은 발송(logId)의 1000건이 동일 본문을 공유하므로 렌더된 html을 logId당 1회만 만들어 캐시한다.
  private readonly htmlCache = new Map<number, Promise<string>>();

  constructor(
    private readonly verificationService: OnchurchEmailVerificationService,
    private readonly sesService: AwsSesService,
    @Inject(ONCHURCH_EMAIL_LOG_REPOSITORY)
    private readonly emailLogRepository: IOnchurchEmailLogRepository,
  ) {
    super();
  }

  async process(job: Job<OnchurchBulkEmailJob>): Promise<void> {
    const { logId, email, subject } = job.data;
    try {
      // 수신 가능 검증(형식/MX/RCPT) — 제외 대상이면 발송하지 않고 excluded로 기록.
      const verification = await this.verificationService.verifyOne(email);
      if (verification.status === 'excluded') {
        await this.record(logId, { email, status: 'excluded', reason: verification.reason });
        return;
      }

      const html = await this.getHtml(logId);
      await this.sesService.send(email, subject, html, ONCHURCH_BULK_EMAIL_MAIL_FROM);
      await this.record(logId, { email, status: 'sent', reason: null });
    } catch (err) {
      const attempts = job.opts.attempts ?? 1;
      const willRetry = this.isTransient(err) && job.attemptsMade < attempts - 1;
      if (willRetry) {
        // BullMQ가 backoff 후 재시도하도록 던진다. (이번 시도는 결과를 기록하지 않음)
        throw err;
      }
      this.logger.error(`대량메일 발송 실패: ${email}`, err as any);
      await this.record(logId, { email, status: 'failed', reason: (err as Error)?.message ?? '발송 실패' });
    }
  }

  private async record(logId: number, result: { email: string; status: 'sent' | 'failed' | 'excluded'; reason: string | null }) {
    const { completed } = await this.emailLogRepository.recordResult(logId, result);
    if (completed) this.htmlCache.delete(logId); // 발송 종료 → 캐시 정리
  }

  private getHtml(logId: number): Promise<string> {
    const cached = this.htmlCache.get(logId);
    if (cached) return cached;
    const promise = (async () => {
      const log = await this.emailLogRepository.findById(logId);
      if (!log) throw new Error(`발송 로그를 찾을 수 없습니다(logId=${logId})`);
      return this.buildHtml(log.content);
    })();
    this.htmlCache.set(logId, promise);
    return promise;
  }

  // 본문은 마스터가 직접 작성한 신뢰 콘텐츠. 줄바꿈만 <br>로 변환해 감싼다. (HTML 직접 작성도 허용)
  private buildHtml(content: string): string {
    const body = content.replace(/\r\n/g, '\n').replace(/\n/g, '<br />');
    return [
      '<div style="font-family: \'Apple SD Gothic Neo\', sans-serif; font-size: 15px; line-height: 1.7; color: #222;">',
      body,
      '</div>',
    ].join('');
  }

  // SES throttle / 네트워크 / 5xx 등 일시 오류만 재시도 대상으로 본다.
  private isTransient(err: unknown): boolean {
    const e = err as { name?: string; code?: string; $metadata?: { httpStatusCode?: number } };
    const name = `${e?.name ?? ''} ${e?.code ?? ''}`.toLowerCase();
    if (name.includes('throttl') || name.includes('timeout') || name.includes('econn') || name.includes('etimedout')) {
      return true;
    }
    const status = e?.$metadata?.httpStatusCode;
    return status === 429 || (typeof status === 'number' && status >= 500);
  }
}
