import { Inject, Injectable } from '@nestjs/common';
import { ONCHURCH_EVENT_REPOSITORY, IOnchurchEventRepository } from '@/onchurch/event/domain/repository/onchurch-event.repository.interface';
import { ONCHURCH_CHURCH_REPOSITORY, IOnchurchChurchRepository } from '@/onchurch/church/domain/repository/onchurch-church.repository.interface';
import { OnchurchEvent } from '@/onchurch/event/domain/entity/onchurch-event.entity';

@Injectable()
export class OnchurchListMyEventsUseCase {
  constructor(
    @Inject(ONCHURCH_EVENT_REPOSITORY)
    private readonly eventRepository: IOnchurchEventRepository,

    @Inject(ONCHURCH_CHURCH_REPOSITORY)
    private readonly churchRepository: IOnchurchChurchRepository,
  ) {}

  async execute(userId: number): Promise<OnchurchEvent[]> {
    const church = await this.churchRepository.findByOwnerId(userId);
    if (!church) return [];
    return this.eventRepository.findAllByChurchId(church.id);
  }
}
