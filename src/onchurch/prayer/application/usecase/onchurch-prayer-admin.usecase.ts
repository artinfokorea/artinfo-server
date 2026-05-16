import { Inject, Injectable } from '@nestjs/common';
import {
  IOnchurchPrayerRepository,
  ONCHURCH_PRAYER_REPOSITORY,
} from '@/onchurch/prayer/domain/repository/onchurch-prayer.repository.interface';
import {
  IOnchurchChurchRepository,
  ONCHURCH_CHURCH_REPOSITORY,
} from '@/onchurch/church/domain/repository/onchurch-church.repository.interface';
import { OnchurchPrayerRequest, OnchurchPrayerStatus } from '@/onchurch/prayer/domain/entity/onchurch-prayer-request.entity';
import { OnchurchPrayerChurchNotConfigured } from '@/onchurch/prayer/domain/exception/onchurch-prayer.exception';

@Injectable()
export class OnchurchListMyPrayersUseCase {
  constructor(
    @Inject(ONCHURCH_PRAYER_REPOSITORY)
    private readonly prayerRepository: IOnchurchPrayerRepository,
    @Inject(ONCHURCH_CHURCH_REPOSITORY)
    private readonly churchRepository: IOnchurchChurchRepository,
  ) {}

  async execute(userId: number): Promise<OnchurchPrayerRequest[]> {
    const church = await this.churchRepository.findByOwnerId(userId);
    if (!church) return [];
    return this.prayerRepository.findAllByChurchId(church.id);
  }
}

@Injectable()
export class OnchurchUpdateMyPrayerStatusUseCase {
  constructor(
    @Inject(ONCHURCH_PRAYER_REPOSITORY)
    private readonly prayerRepository: IOnchurchPrayerRepository,
    @Inject(ONCHURCH_CHURCH_REPOSITORY)
    private readonly churchRepository: IOnchurchChurchRepository,
  ) {}

  async execute(userId: number, id: number, status: OnchurchPrayerStatus): Promise<OnchurchPrayerRequest> {
    const church = await this.churchRepository.findByOwnerId(userId);
    if (!church) throw new OnchurchPrayerChurchNotConfigured();
    return this.prayerRepository.updateStatus(church.id, id, status);
  }
}

@Injectable()
export class OnchurchDeleteMyPrayerUseCase {
  constructor(
    @Inject(ONCHURCH_PRAYER_REPOSITORY)
    private readonly prayerRepository: IOnchurchPrayerRepository,
    @Inject(ONCHURCH_CHURCH_REPOSITORY)
    private readonly churchRepository: IOnchurchChurchRepository,
  ) {}

  async execute(userId: number, id: number): Promise<void> {
    const church = await this.churchRepository.findByOwnerId(userId);
    if (!church) throw new OnchurchPrayerChurchNotConfigured();
    await this.prayerRepository.remove(church.id, id);
  }
}
