import { Inject, Injectable } from '@nestjs/common';
import { ONCHURCH_CHURCH_REPOSITORY, IOnchurchChurchRepository } from '@/onchurch/church/domain/repository/onchurch-church.repository.interface';
import { ONCHURCH_USER_REPOSITORY, IOnchurchUserRepository } from '@/onchurch/user/domain/repository/onchurch-user.repository.interface';
import { OnchurchChurch } from '@/onchurch/church/domain/entity/onchurch-church.entity';
import {
  OnchurchChurchNotFound,
  OnchurchChurchRequiredFieldsMissing,
  OnchurchSubscriptionRequired,
} from '@/onchurch/church/domain/exception/onchurch-church.exception';

function hasRequiredFields(church: OnchurchChurch): boolean {
  return (
    !!church.slug?.trim() &&
    !!church.name?.trim() &&
    !!church.phone?.trim() &&
    !!church.email?.trim() &&
    !!church.address?.trim()
  );
}

function isSubscriptionActive(freeTrialUntil: Date | null, paidUntil: Date | null): boolean {
  const now = Date.now();
  if (freeTrialUntil && freeTrialUntil.getTime() > now) return true;
  if (paidUntil && paidUntil.getTime() > now) return true;
  return false;
}

@Injectable()
export class OnchurchPublishMyChurchUseCase {
  constructor(
    @Inject(ONCHURCH_CHURCH_REPOSITORY)
    private readonly churchRepository: IOnchurchChurchRepository,

    @Inject(ONCHURCH_USER_REPOSITORY)
    private readonly userRepository: IOnchurchUserRepository,
  ) {}

  async execute(userId: number, isPublished: boolean): Promise<OnchurchChurch> {
    if (!isPublished) {
      // 사이트 운영 끄기는 조건 없이 허용
      return this.churchRepository.updatePublished(userId, false);
    }

    const church = await this.churchRepository.findByOwnerId(userId);
    if (!church) throw new OnchurchChurchNotFound();
    if (!hasRequiredFields(church)) throw new OnchurchChurchRequiredFieldsMissing();

    const user = await this.userRepository.findOneOrThrowById(userId);
    if (!isSubscriptionActive(user.freeTrialUntil, user.paidUntil)) {
      throw new OnchurchSubscriptionRequired();
    }

    return this.churchRepository.updatePublished(userId, true);
  }
}
