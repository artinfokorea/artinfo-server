import { Inject, Injectable } from '@nestjs/common';
import { ONCHURCH_EVENT_REPOSITORY, IOnchurchEventRepository } from '@/onchurch/event/domain/repository/onchurch-event.repository.interface';
import { OnchurchChurchManagerResolver } from '@/onchurch/church/application/service/onchurch-church-manager.resolver';
import { OnchurchEventChurchNotConfigured, OnchurchEventNotFound } from '@/onchurch/event/domain/exception/onchurch-event.exception';

@Injectable()
export class OnchurchDeleteMyEventUseCase {
  constructor(
    @Inject(ONCHURCH_EVENT_REPOSITORY)
    private readonly eventRepository: IOnchurchEventRepository,

    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}

  async execute(userId: number, eventId: number): Promise<void> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) throw new OnchurchEventChurchNotConfigured();
    const owned = await this.eventRepository.findOwnedById(church.id, eventId);
    if (!owned) throw new OnchurchEventNotFound();
    await this.eventRepository.remove(church.id, eventId);
  }
}
