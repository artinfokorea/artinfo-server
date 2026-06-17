import { ForbiddenException, Inject, Injectable, Logger } from '@nestjs/common';
import { AwsSesService } from '@/aws/ses/aws-ses.service';
import {
  IOnchurchUserRepository,
  ONCHURCH_USER_REPOSITORY,
} from '@/onchurch/user/domain/repository/onchurch-user.repository.interface';
import { ONCHURCH_USER_ROLE } from '@/onchurch/user/domain/entity/onchurch-user.entity';
import { BulkEmailResult } from '@/onchurch/master/presentation/dto/response/onchurch-bulk-email-result.response';
import {
  IOnchurchEmailLogRepository,
  ONCHURCH_EMAIL_LOG_REPOSITORY,
} from '@/onchurch/master/domain/repository/onchurch-email-log.repository.interface';
import { OnchurchEmailRecipientResult } from '@/onchurch/master/domain/entity/onchurch-email-log.entity';
import { OnchurchEmailVerificationService } from '@/onchurch/master/application/service/onchurch-email-verification.service';

const MAIL_FROM = '온교회 <artinfokorea2022@gmail.com>';

@Injectable()
export class OnchurchSendBulkEmailUseCase {
  private readonly logger = new Logger(OnchurchSendBulkEmailUseCase.name);

  constructor(
    @Inject(ONCHURCH_USER_REPOSITORY)
    private readonly userRepository: IOnchurchUserRepository,
    @Inject(ONCHURCH_EMAIL_LOG_REPOSITORY)
    private readonly emailLogRepository: IOnchurchEmailLogRepository,
    private readonly verificationService: OnchurchEmailVerificationService,
    private readonly sesService: AwsSesService,
  ) {}

  async execute(userId: number, params: { subject: string; content: string; recipients: string[] }): Promise<BulkEmailResult> {
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

    // 1+2+3단계 수신 가능 검증
    const verifications = await this.verificationService.verifyMany(candidates);

    const html = this.buildHtml(params.content);
    const results: OnchurchEmailRecipientResult[] = [];
    let sent = 0;
    let failed = 0;
    let excluded = 0;

    for (const v of verifications) {
      if (v.status === 'excluded') {
        results.push({ email: v.email, status: 'excluded', reason: v.reason });
        excluded += 1;
        continue;
      }
      try {
        await this.sesService.send(v.email, params.subject, html, MAIL_FROM);
        results.push({ email: v.email, status: 'sent', reason: null });
        sent += 1;
      } catch (err) {
        this.logger.error(`대량메일 발송 실패: ${v.email}`, err as any);
        results.push({ email: v.email, status: 'failed', reason: (err as Error)?.message ?? '발송 실패' });
        failed += 1;
      }
    }

    const total = candidates.length;
    const result: BulkEmailResult = { total, sent, failed, excluded, results };

    // 발송 내역 기록 — 누구에게 어떤 내용을 보냈고 각 주소가 성공/제외/실패였는지 저장
    await this.emailLogRepository.create({
      senderId: user.id,
      senderName: user.name,
      subject: params.subject,
      content: params.content,
      results,
      total,
      sent,
      failed,
      excluded,
    });

    return result;
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
}
