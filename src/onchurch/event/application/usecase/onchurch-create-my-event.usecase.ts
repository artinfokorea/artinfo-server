import { Inject, Injectable } from '@nestjs/common';
import { ONCHURCH_EVENT_REPOSITORY, IOnchurchEventRepository } from '@/onchurch/event/domain/repository/onchurch-event.repository.interface';
import { ONCHURCH_CHURCH_REPOSITORY, IOnchurchChurchRepository } from '@/onchurch/church/domain/repository/onchurch-church.repository.interface';
import { OnchurchEvent } from '@/onchurch/event/domain/entity/onchurch-event.entity';
import { OnchurchEventWriteCommand } from '@/onchurch/event/application/command/onchurch-event-write.command';
import { OnchurchEventChurchNotConfigured } from '@/onchurch/event/domain/exception/onchurch-event.exception';

@Injectable()
export class OnchurchCreateMyEventUseCase {
  constructor(
    @Inject(ONCHURCH_EVENT_REPOSITORY)
    private readonly eventRepository: IOnchurchEventRepository,

    @Inject(ONCHURCH_CHURCH_REPOSITORY)
    private readonly churchRepository: IOnchurchChurchRepository,
  ) {}

  async execute(userId: number, command: OnchurchEventWriteCommand): Promise<OnchurchEvent> {
    const church = await this.churchRepository.findByOwnerId(userId);
    if (!church) throw new OnchurchEventChurchNotConfigured();
    return this.eventRepository.create(church.id, command);
  }
}
