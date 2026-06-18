import { BadRequestException, ForbiddenException, Inject, Injectable, Logger } from '@nestjs/common';
import { SystemService } from '@/system/service/system.service';
import {
  IOnchurchUserRepository,
  ONCHURCH_USER_REPOSITORY,
} from '@/onchurch/user/domain/repository/onchurch-user.repository.interface';
import { ONCHURCH_USER_ROLE } from '@/onchurch/user/domain/entity/onchurch-user.entity';
import { BulkSmsResult } from '@/onchurch/master/presentation/dto/response/onchurch-bulk-sms-result.response';
import {
  IOnchurchSmsLogRepository,
  ONCHURCH_SMS_LOG_REPOSITORY,
} from '@/onchurch/master/domain/repository/onchurch-sms-log.repository.interface';
import { OnchurchSmsRecipientResult } from '@/onchurch/master/domain/entity/onchurch-sms-log.entity';

// LMS 장문 문자 최대 본문 길이(바이트). 한글 2바이트 기준으로 계산한다.
export const SMS_CONTENT_MAX_BYTES = 2000;

// 한글 등 멀티바이트 문자는 2바이트, ASCII는 1바이트로 계산 (국내 문자 발송 바이트 기준).
export function smsByteLength(text: string): number {
  let bytes = 0;
  for (const ch of text) {
    bytes += ch.charCodeAt(0) > 0x7f ? 2 : 1;
  }
  return bytes;
}

// 숫자만 추출한 뒤 국내 휴대폰 번호 형식인지 검증한다.
function normalizePhone(raw: string): { phone: string; valid: boolean } {
  const digits = (raw ?? '').replace(/[^0-9]/g, '');
  const valid = /^01[016789][0-9]{7,8}$/.test(digits);
  return { phone: digits || (raw ?? '').trim(), valid };
}

@Injectable()
export class OnchurchSendBulkSmsUseCase {
  private readonly logger = new Logger(OnchurchSendBulkSmsUseCase.name);

  constructor(
    @Inject(ONCHURCH_USER_REPOSITORY)
    private readonly userRepository: IOnchurchUserRepository,
    @Inject(ONCHURCH_SMS_LOG_REPOSITORY)
    private readonly smsLogRepository: IOnchurchSmsLogRepository,
    private readonly systemService: SystemService,
  ) {}

  async execute(userId: number, params: { subject: string; content: string; recipients: string[] }): Promise<BulkSmsResult> {
    const user = await this.userRepository.findOneOrThrowById(userId);
    if (user.role !== ONCHURCH_USER_ROLE.MASTER) {
      throw new ForbiddenException('마스터 권한이 필요합니다.');
    }

    if (smsByteLength(params.content) > SMS_CONTENT_MAX_BYTES) {
      throw new BadRequestException(`문자 본문은 최대 ${SMS_CONTENT_MAX_BYTES}바이트까지 입력할 수 있습니다.`);
    }

    // 정규화 + 중복 제거 (숫자만 남긴 번호 기준)
    const seen = new Set<string>();
    const candidates: { phone: string; valid: boolean }[] = [];
    for (const raw of params.recipients) {
      const normalized = normalizePhone(raw);
      if (!normalized.phone || seen.has(normalized.phone)) continue;
      seen.add(normalized.phone);
      candidates.push(normalized);
    }

    const results: OnchurchSmsRecipientResult[] = [];
    let sent = 0;
    let failed = 0;
    let excluded = 0;

    for (const c of candidates) {
      if (!c.valid) {
        results.push({ phone: c.phone, status: 'excluded', reason: '유효하지 않은 휴대폰 번호' });
        excluded += 1;
        continue;
      }
      try {
        await this.systemService.sendSMS(c.phone, params.content, params.subject);
        results.push({ phone: c.phone, status: 'sent', reason: null });
        sent += 1;
      } catch (err) {
        this.logger.error(`대량문자 발송 실패: ${c.phone}`, err as any);
        results.push({ phone: c.phone, status: 'failed', reason: (err as Error)?.message ?? '발송 실패' });
        failed += 1;
      }
    }

    const total = candidates.length;
    const result: BulkSmsResult = { total, sent, failed, excluded, results };

    // 발송 내역 기록 — 누구에게 어떤 내용을 보냈고 각 번호가 성공/제외/실패였는지 저장
    await this.smsLogRepository.create({
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
}
