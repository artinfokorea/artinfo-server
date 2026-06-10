import { Inject, Injectable } from '@nestjs/common';
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

const FREE_TRIAL_DAYS = 7;

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
  constructor(
    @Inject(ONCHURCH_CHURCH_REPOSITORY)
    private readonly churchRepository: IOnchurchChurchRepository,

    @Inject(ONCHURCH_USER_REPOSITORY)
    private readonly userRepository: IOnchurchUserRepository,

    private readonly requiredService: OnchurchChurchRequiredService,

    private readonly managerResolver: OnchurchChurchManagerResolver,
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
    return { church, user };
  }
}
