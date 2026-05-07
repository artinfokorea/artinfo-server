import { Inject, Injectable } from '@nestjs/common';
import { ONCHURCH_EVENT_REPOSITORY, IOnchurchEventRepository } from '@/onchurch/event/domain/repository/onchurch-event.repository.interface';
import { ONCHURCH_CHURCH_REPOSITORY, IOnchurchChurchRepository } from '@/onchurch/church/domain/repository/onchurch-church.repository.interface';
import { OnchurchEventChurchNotConfigured, OnchurchEventNotFound } from '@/onchurch/event/domain/exception/onchurch-event.exception';

@Injectable()
export class OnchurchDeleteMyEventUseCase {
  constructor(
    @Inject(ONCHURCH_EVENT_REPOSITORY)
    private readonly eventRepository: IOnchurchEventRepository,

    @Inject(ONCHURCH_CHURCH_REPOSITORY)
    private readonly churchRepository: IOnchurchChurchRepository,
  ) {}

  async execute(userId: number, eventId: number): Promise<void> {
    const church = await this.churchRepository.findByOwnerId(userId);
    if (!church) throw new OnchurchEventChurchNotConfigured();
    const owned = await this.eventRepository.findOwnedById(church.id, eventId);
    if (!owned) throw new OnchurchEventNotFound();
    await this.eventRepository.remove(church.id, eventId);
  }
}
