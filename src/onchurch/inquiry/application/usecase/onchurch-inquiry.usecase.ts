import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  IOnchurchInquiryRepository,
  ONCHURCH_INQUIRY_REPOSITORY,
} from '@/onchurch/inquiry/domain/repository/onchurch-inquiry.repository.interface';
import { OnchurchInquiry } from '@/onchurch/inquiry/domain/entity/onchurch-inquiry.entity';
import { AwsSesService } from '@/aws/ses/aws-ses.service';
import {
  IOnchurchUserRepository,
  ONCHURCH_USER_REPOSITORY,
} from '@/onchurch/user/domain/repository/onchurch-user.repository.interface';

const SUPPORT_NOTIFY_TO = 'chorales@naver.com';

@Injectable()
export class OnchurchCreateMyInquiryUseCase {
  private readonly logger = new Logger(OnchurchCreateMyInquiryUseCase.name);

  constructor(
    @Inject(ONCHURCH_INQUIRY_REPOSITORY)
    private readonly inquiryRepository: IOnchurchInquiryRepository,
    @Inject(ONCHURCH_USER_REPOSITORY)
    private readonly userRepository: IOnchurchUserRepository,
    private readonly sesService: AwsSesService,
  ) {}

  async execute(userId: number, question: string): Promise<OnchurchInquiry> {
    const inquiry = await this.inquiryRepository.create(userId, question);

    // 운영자 알림 메일 — 실패해도 본 트랜잭션은 통과시킨다.
    try {
      const user = await this.userRepository.findOneOrThrowById(userId);
      const safeQuestion = inquiry.question.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const html = [
        `<h3>온교회 문의가 접수되었습니다</h3>`,
        `<p><b>문의 ID</b>: ${inquiry.id}</p>`,
        `<p><b>작성자</b>: ${user.name} (${user.loginId}) / ${user.phone}</p>`,
        `<p><b>교회</b>: ${user.churchName ?? '-'}</p>`,
        `<hr />`,
        `<pre style="white-space: pre-wrap; font-family: inherit;">${safeQuestion}</pre>`,
      ].join('');
      await this.sesService.send(SUPPORT_NOTIFY_TO, `[온교회 문의] ${user.churchName ?? user.name}`, html);
    } catch (err) {
      this.logger.error(`문의 알림 메일 발송 실패: inquiryId=${inquiry.id}`, err as any);
    }

    return inquiry;
  }
}

@Injectable()
export class OnchurchListMyInquiriesUseCase {
  constructor(
    @Inject(ONCHURCH_INQUIRY_REPOSITORY)
    private readonly inquiryRepository: IOnchurchInquiryRepository,
  ) {}

  async execute(userId: number): Promise<OnchurchInquiry[]> {
    return this.inquiryRepository.findAllByUserId(userId);
  }
}
