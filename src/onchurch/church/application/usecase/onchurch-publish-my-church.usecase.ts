import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ONCHURCH_CHURCH_REPOSITORY, IOnchurchChurchRepository } from '@/onchurch/church/domain/repository/onchurch-church.repository.interface';
import { ONCHURCH_USER_REPOSITORY, IOnchurchUserRepository } from '@/onchurch/user/domain/repository/onchurch-user.repository.interface';
import { OnchurchChurch } from '@/onchurch/church/domain/entity/onchurch-church.entity';
import { OnchurchUser } from '@/onchurch/user/domain/entity/onchurch-user.entity';
import { OnchurchPastor } from '@/onchurch/about/domain/entity/onchurch-pastor.entity';
import { OnchurchWorshipService } from '@/onchurch/worship/domain/entity/onchurch-worship-service.entity';
import {
  OnchurchChurchNotFound,
  OnchurchChurchRequiredFieldsMissing,
  OnchurchSubscriptionRequired,
} from '@/onchurch/church/domain/exception/onchurch-church.exception';

const FREE_TRIAL_DAYS = 7;

function hasChurchBaseFields(church: OnchurchChurch): boolean {
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

    @InjectRepository(OnchurchPastor)
    private readonly pastorRepository: Repository<OnchurchPastor>,

    @InjectRepository(OnchurchWorshipService)
    private readonly worshipServiceRepository: Repository<OnchurchWorshipService>,
  ) {}

  async execute(userId: number, isPublished: boolean): Promise<PublishResult> {
    if (!isPublished) {
      const church = await this.churchRepository.updatePublished(userId, false);
      const user = await this.userRepository.findOneOrThrowById(userId);
      return { church, user };
    }

    const existing = await this.churchRepository.findByOwnerId(userId);
    if (!existing) throw new OnchurchChurchNotFound();
    if (!hasChurchBaseFields(existing)) throw new OnchurchChurchRequiredFieldsMissing();

    const pastor = await this.pastorRepository.findOneBy({ churchId: existing.id });
    if (!pastor || !pastor.name?.trim()) throw new OnchurchChurchRequiredFieldsMissing();

    const worshipServiceCount = await this.worshipServiceRepository.count({ where: { churchId: existing.id } });
    if (worshipServiceCount === 0) throw new OnchurchChurchRequiredFieldsMissing();

    let user = await this.userRepository.findOneOrThrowById(userId);

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

    const church = await this.churchRepository.updatePublished(userId, true, isFirstPublish ? now : undefined);
    return { church, user };
  }
}
