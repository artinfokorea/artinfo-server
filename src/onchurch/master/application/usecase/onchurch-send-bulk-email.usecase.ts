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

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAIL_FROM = '온교회 <artinfokorea2022@gmail.com>';

@Injectable()
export class OnchurchSendBulkEmailUseCase {
  private readonly logger = new Logger(OnchurchSendBulkEmailUseCase.name);

  constructor(
    @Inject(ONCHURCH_USER_REPOSITORY)
    private readonly userRepository: IOnchurchUserRepository,
    @Inject(ONCHURCH_EMAIL_LOG_REPOSITORY)
    private readonly emailLogRepository: IOnchurchEmailLogRepository,
    private readonly sesService: AwsSesService,
  ) {}

  async execute(userId: number, params: { subject: string; content: string; recipients: string[] }): Promise<BulkEmailResult> {
    const user = await this.userRepository.findOneOrThrowById(userId);
    if (user.role !== ONCHURCH_USER_ROLE.MASTER) {
      throw new ForbiddenException('마스터 권한이 필요합니다.');
    }

    // 정규화 + 중복 제거
    const seen = new Set<string>();
    const recipients: string[] = [];
    const failures: { email: string; reason: string }[] = [];
    for (const raw of params.recipients) {
      const email = (raw ?? '').trim().toLowerCase();
      if (!email) continue;
      if (seen.has(email)) continue;
      seen.add(email);
      if (!EMAIL_REGEX.test(email)) {
        failures.push({ email, reason: '이메일 형식 오류' });
        continue;
      }
      recipients.push(email);
    }

    const html = this.buildHtml(params.content);

    // 수신자별 개별 발송 (서로의 주소가 노출되지 않도록)
    let sent = 0;
    for (const email of recipients) {
      try {
        await this.sesService.send(email, params.subject, html, MAIL_FROM);
        sent += 1;
      } catch (err) {
        this.logger.error(`대량메일 발송 실패: ${email}`, err as any);
        failures.push({ email, reason: (err as Error)?.message ?? '발송 실패' });
      }
    }

    const total = recipients.length + failures.filter((f) => f.reason === '이메일 형식 오류').length;
    const result: BulkEmailResult = { total, sent, failed: failures.length, failures };

    // 발송 내역 기록 — 누구에게 어떤 내용을 보냈는지 추후 확인할 수 있도록 저장한다.
    await this.emailLogRepository.create({
      senderId: user.id,
      senderName: user.name,
      subject: params.subject,
      content: params.content,
      recipients,
      total,
      sent,
      failed: failures.length,
      failures,
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
