import { Inject, Injectable } from '@nestjs/common';
import {
  ONCHURCH_TRANSPORTATION_REPOSITORY,
  IOnchurchTransportationRepository,
} from '@/onchurch/transportation/domain/repository/onchurch-transportation.repository.interface';
import { OnchurchChurchManagerResolver } from '@/onchurch/church/application/service/onchurch-church-manager.resolver';
import { OnchurchTransportation } from '@/onchurch/transportation/domain/entity/onchurch-transportation.entity';
import { OnchurchTransportationWriteCommand } from '@/onchurch/transportation/application/command/onchurch-transportation-write.command';
import { OnchurchTransportationChurchNotConfigured } from '@/onchurch/transportation/domain/exception/onchurch-transportation.exception';

@Injectable()
export class OnchurchCreateMyTransportationUseCase {
  constructor(
    @Inject(ONCHURCH_TRANSPORTATION_REPOSITORY)
    private readonly repo: IOnchurchTransportationRepository,

    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}

  async execute(userId: number, command: OnchurchTransportationWriteCommand): Promise<OnchurchTransportation> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) throw new OnchurchTransportationChurchNotConfigured();
    return this.repo.create(church.id, command);
  }
}
