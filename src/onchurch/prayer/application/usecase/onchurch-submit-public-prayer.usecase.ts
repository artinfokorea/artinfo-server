import { Inject, Injectable } from '@nestjs/common';
import {
  IOnchurchPrayerRepository,
  ONCHURCH_PRAYER_REPOSITORY,
  OnchurchPrayerCreateParams,
} from '@/onchurch/prayer/domain/repository/onchurch-prayer.repository.interface';
import {
  IOnchurchChurchRepository,
  ONCHURCH_CHURCH_REPOSITORY,
} from '@/onchurch/church/domain/repository/onchurch-church.repository.interface';
import { OnchurchPrayerRequest } from '@/onchurch/prayer/domain/entity/onchurch-prayer-request.entity';
import { OnchurchPrayerChurchNotFound } from '@/onchurch/prayer/domain/exception/onchurch-prayer.exception';

@Injectable()
export class OnchurchSubmitPublicPrayerUseCase {
  constructor(
    @Inject(ONCHURCH_PRAYER_REPOSITORY)
    private readonly prayerRepository: IOnchurchPrayerRepository,

    @Inject(ONCHURCH_CHURCH_REPOSITORY)
    private readonly churchRepository: IOnchurchChurchRepository,
  ) {}

  async execute(slug: string, params: OnchurchPrayerCreateParams): Promise<OnchurchPrayerRequest> {
    const church = await this.churchRepository.findPublishedBySlug(slug);
    if (!church) throw new OnchurchPrayerChurchNotFound();
    return this.prayerRepository.create(church.id, params);
  }
}
