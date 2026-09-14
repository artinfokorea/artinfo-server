import { Inject, Injectable, Logger } from '@nestjs/common';
import { IOngiInquiryRepository, ONGI_INQUIRY_REPOSITORY } from '@/ongi/inquiry/domain/repository/ongi-inquiry.repository.interface';
import { OngiInquiry } from '@/ongi/inquiry/domain/entity/ongi-inquiry.entity';
import { buildInquiryNotifyMail, normalizeInquiryText } from '@/ongi/inquiry/domain/service/ongi-inquiry-policy';
import { IOngiUserRepository, ONGI_USER_REPOSITORY } from '@/ongi/user/domain/repository/ongi-user.repository.interface';
import { AwsSesService } from '@/aws/ses/aws-ses.service';

const ONGI_MAIL_FROM = '온기 <artinfokorea2022@gmail.com>';
import { OngiInquiryInvalidContent } from '@/ongi/inquiry/domain/exception/ongi-inquiry.exception';

@Injectable()
export class OngiCreateInquiryUseCase {
  private readonly logger = new Logger(OngiCreateInquiryUseCase.name);

  constructor(
    @Inject(ONGI_INQUIRY_REPOSITORY)
    private readonly inquiryRepository: IOngiInquiryRepository,

    @Inject(ONGI_USER_REPOSITORY)
    private readonly userRepository: IOngiUserRepository,

    private readonly sesService: AwsSesService,
  ) {}

  /** 문의 접수 후 운영자에게 알림 메일 — 메일 실패는 로그만 남기고 접수는 성공시킨다 */
  async execute(userId: number, rawContent: string): Promise<OngiInquiry> {
    const content = normalizeInquiryText(rawContent);
    if (!content) throw new OngiInquiryInvalidContent();

    const inquiry = await this.inquiryRepository.create({ userId, content });
    void this.notifyOperator(inquiry);

    return inquiry;
  }

  private async notifyOperator(inquiry: OngiInquiry): Promise<void> {
    try {
      const user = await this.userRepository.findById(inquiry.userId);
      const mail = buildInquiryNotifyMail({
        inquiryId: inquiry.id,
        userId: inquiry.userId,
        userName: user?.name ?? '알 수 없음',
        userEmail: user?.email ?? null,
        content: inquiry.content,
      });
      await this.sesService.send(mail.to, mail.subject, mail.html, ONGI_MAIL_FROM);
    } catch (error) {
      this.logger.error(`문의 알림 메일 발송 실패: inquiryId=${inquiry.id} ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

@Injectable()
export class OngiScanMyInquiriesUseCase {
  constructor(
    @Inject(ONGI_INQUIRY_REPOSITORY)
    private readonly inquiryRepository: IOngiInquiryRepository,
  ) {}

  execute(userId: number): Promise<OngiInquiry[]> {
    return this.inquiryRepository.scanByUserId(userId);
  }
}
