import { Injectable, Logger } from '@nestjs/common';
import { InquiryRepository } from '@/system/repository/inquiry.repository';
import { CreateInquiryCommand } from '@/system/dto/command/create-inquiry.command';
import { InquiryCreator } from '@/system/repository/operation/inquiry.creator';
import { detectInquirySpam, InquiryRateLimiter } from '@/system/service/inquiry-spam.filter';

export interface InquirySubmitMeta {
  ip?: string | null;
  website?: string | null;
  startedAt?: number | null;
}

@Injectable()
export class InquiryService {
  private readonly logger = new Logger(InquiryService.name);
  private readonly limiter = new InquiryRateLimiter();

  constructor(private readonly inquiryRepository: InquiryRepository) {}

  /**
   * 문의 저장. 스팸(허니팟·3초 내 제출·기계 글자열·IP/이메일 반복)이면 저장하지 않고 0 을 돌려준다 —
   * 응답은 성공과 같아서 봇이 걸러진 걸 알 수 없다
   */
  async createInquiry(command: CreateInquiryCommand, meta: InquirySubmitMeta = {}): Promise<number> {
    const reason =
      detectInquirySpam({ title: command.title, contents: command.contents, email: command.email, website: meta.website, startedAt: meta.startedAt }) ??
      (this.limiter.allow(meta.ip, command.email) ? null : 'rate-limit');
    if (reason) {
      this.logger.warn(`문의 스팸 차단(${reason}) ip=${meta.ip ?? '-'} email=${command.email} title=${command.title.slice(0, 40)}`);
      return 0;
    }
    const creator = new InquiryCreator({
      title: command.title,
      contents: command.contents,
      email: command.email,
    });

    return this.inquiryRepository.create(creator);
  }
}
