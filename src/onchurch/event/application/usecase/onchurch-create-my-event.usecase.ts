import { Inject, Injectable } from '@nestjs/common';
import { ONCHURCH_EVENT_REPOSITORY, IOnchurchEventRepository } from '@/onchurch/event/domain/repository/onchurch-event.repository.interface';
import { OnchurchChurchManagerResolver } from '@/onchurch/church/application/service/onchurch-church-manager.resolver';
import { OnchurchEvent } from '@/onchurch/event/domain/entity/onchurch-event.entity';
import { OnchurchEventWriteCommand } from '@/onchurch/event/application/command/onchurch-event-write.command';
import { OnchurchEventChurchNotConfigured } from '@/onchurch/event/domain/exception/onchurch-event.exception';

@Injectable()
export class OnchurchCreateMyEventUseCase {
  constructor(
    @Inject(ONCHURCH_EVENT_REPOSITORY)
    private readonly eventRepository: IOnchurchEventRepository,

    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}

  async execute(userId: number, command: OnchurchEventWriteCommand): Promise<OnchurchEvent> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) throw new OnchurchEventChurchNotConfigured();
    return this.eventRepository.create(church.id, command);
  }
}
