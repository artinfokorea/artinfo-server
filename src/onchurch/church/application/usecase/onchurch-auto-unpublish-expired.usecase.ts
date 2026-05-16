import { Inject, Injectable, Logger } from '@nestjs/common';
import { ONCHURCH_CHURCH_REPOSITORY, IOnchurchChurchRepository } from '@/onchurch/church/domain/repository/onchurch-church.repository.interface';

export interface AutoUnpublishResult {
  expiredCount: number;
  unpublishedCount: number;
  slugs: string[];
}

@Injectable()
export class OnchurchAutoUnpublishExpiredUseCase {
  private readonly logger = new Logger(OnchurchAutoUnpublishExpiredUseCase.name);

  constructor(
    @Inject(ONCHURCH_CHURCH_REPOSITORY)
    private readonly churchRepository: IOnchurchChurchRepository,
  ) {}

  async execute(now: Date = new Date()): Promise<AutoUnpublishResult> {
    const expired = await this.churchRepository.findPublishedWithExpiredSubscription(now);
    if (expired.length === 0) {
      return { expiredCount: 0, unpublishedCount: 0, slugs: [] };
    }

    const ownerIds = expired.map((c) => c.ownerId);
    const slugs = expired.map((c) => c.slug);
    const affected = await this.churchRepository.bulkUnpublishByOwnerIds(ownerIds);

    this.logger.log(`사이트 운영 자동 OFF: ${affected}개 (slugs=${slugs.join(',')})`);
    return { expiredCount: expired.length, unpublishedCount: affected, slugs };
  }
}
