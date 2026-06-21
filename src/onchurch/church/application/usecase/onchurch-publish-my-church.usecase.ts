import { Inject, Injectable, Logger } from '@nestjs/common';
import { ONCHURCH_CHURCH_REPOSITORY, IOnchurchChurchRepository } from '@/onchurch/church/domain/repository/onchurch-church.repository.interface';
import { ONCHURCH_USER_REPOSITORY, IOnchurchUserRepository } from '@/onchurch/user/domain/repository/onchurch-user.repository.interface';
import { OnchurchChurch } from '@/onchurch/church/domain/entity/onchurch-church.entity';
import { OnchurchUser } from '@/onchurch/user/domain/entity/onchurch-user.entity';
import {
  OnchurchChurchNotFound,
  OnchurchSubscriptionRequired,
} from '@/onchurch/church/domain/exception/onchurch-church.exception';
import { OnchurchChurchRequiredService } from '@/onchurch/church/application/service/onchurch-church-required.service';
import { OnchurchChurchManagerResolver } from '@/onchurch/church/application/service/onchurch-church-manager.resolver';
import { AwsSesService } from '@/aws/ses/aws-ses.service';
import { ONCHURCH_MAIL_FROM } from '@/onchurch/onchurch-mail.constant';

const FREE_TRIAL_DAYS = 7;

// 회원가입 알림과 동일한 운영자 수신 주소.
const FIRST_PUBLISH_NOTIFY_TO = 'chorales@naver.com';

function isSubscriptionActive(freeTrialUntil: Date | null, paidUntil: Date | null): boolean {
  const now = Date.now();
  if (freeTrialUntil && freeTrialUntil.getTime() > now) return true;
  if (paidUntil && paidUntil.getTime() > now) return true;
  return false;
}

export interface PublishResult {
  church: OnchurchChurch;
  user: OnchurchUser;
}

@Injectable()
export class OnchurchPublishMyChurchUseCase {
  private readonly logger = new Logger(OnchurchPublishMyChurchUseCase.name);

  constructor(
    @Inject(ONCHURCH_CHURCH_REPOSITORY)
    private readonly churchRepository: IOnchurchChurchRepository,

    @Inject(ONCHURCH_USER_REPOSITORY)
    private readonly userRepository: IOnchurchUserRepository,

    private readonly requiredService: OnchurchChurchRequiredService,

    private readonly managerResolver: OnchurchChurchManagerResolver,

    private readonly sesService: AwsSesService,
  ) {}

  async execute(userId: number, isPublished: boolean): Promise<PublishResult> {
    // 관리자도 발행할 수 있도록, 실제 교회 소유자(owner_id) 기준으로 동작한다.
    // 구독(무료체험/결제)은 오너의 user 레코드에 귀속된다.
    const ownerId = await this.managerResolver.resolveOwnerId(userId);

    if (!isPublished) {
      const church = await this.churchRepository.updatePublished(ownerId, false);
      const user = await this.userRepository.findOneOrThrowById(ownerId);
      return { church, user };
    }

    const existing = await this.churchRepository.findByOwnerId(ownerId);
    if (!existing) throw new OnchurchChurchNotFound();
    await this.requiredService.validateOrThrow(existing);

    let user = await this.userRepository.findOneOrThrowById(ownerId);

    // 첫 publish ON: 7일 무료 체험 자동 부여
    const isFirstPublish = !existing.firstPublishedAt;
    const now = new Date();
    if (isFirstPublish) {
      user.freeTrialUntil = new Date(now.getTime() + FREE_TRIAL_DAYS * 24 * 60 * 60 * 1000);
      await this.userRepository.saveEntity(user);
    }

    if (!isSubscriptionActive(user.freeTrialUntil, user.paidUntil)) {
      throw new OnchurchSubscriptionRequired();
    }

    const church = await this.churchRepository.updatePublished(ownerId, true, isFirstPublish ? now : undefined);

    // 첫 오픈 알림 메일 — 교회 사이트를 처음 공개한 시점에만 운영자에게 발송한다.
    // 실패해도 오픈 자체는 통과시킨다.
    if (isFirstPublish) {
      try {
        const html = [
          `<h3>온교회 신규 사이트 오픈</h3>`,
          `<p><b>교회명</b>: ${church.name}</p>`,
          `<p><b>주소(서브도메인)</b>: ${church.slug}</p>`,
          `<p><b>오너 아이디</b>: ${user.loginId}</p>`,
          `<p><b>오너 이름</b>: ${user.name}</p>`,
          `<p><b>연락처</b>: ${user.phone}</p>`,
          `<p><b>오픈 일시</b>: ${now.toISOString()}</p>`,
        ].join('');
        await this.sesService.send(FIRST_PUBLISH_NOTIFY_TO, `[온교회 오픈] ${church.name}`, html, ONCHURCH_MAIL_FROM);
      } catch (err) {
        this.logger.error(`첫 오픈 알림 메일 발송 실패: ownerId=${ownerId}`, err as any);
      }
    }

    return { church, user };
  }
}
