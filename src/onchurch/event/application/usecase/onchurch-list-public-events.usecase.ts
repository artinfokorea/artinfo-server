import { Inject, Injectable } from '@nestjs/common';
import { ONCHURCH_EVENT_REPOSITORY, IOnchurchEventRepository } from '@/onchurch/event/domain/repository/onchurch-event.repository.interface';
import { ONCHURCH_CHURCH_REPOSITORY, IOnchurchChurchRepository } from '@/onchurch/church/domain/repository/onchurch-church.repository.interface';
import { OnchurchEvent } from '@/onchurch/event/domain/entity/onchurch-event.entity';

@Injectable()
export class OnchurchListPublicEventsUseCase {
  constructor(
    @Inject(ONCHURCH_EVENT_REPOSITORY)
    private readonly eventRepository: IOnchurchEventRepository,

    @Inject(ONCHURCH_CHURCH_REPOSITORY)
    private readonly churchRepository: IOnchurchChurchRepository,
  ) {}

  async execute(slug: string, params: { from: Date | null; to: Date | null }): Promise<OnchurchEvent[]> {
    const church = await this.churchRepository.findBySlug(slug);
    if (!church) return [];
    return this.eventRepository.findActiveByChurchIdInRange(church.id, params.from, params.to);
  }
}
