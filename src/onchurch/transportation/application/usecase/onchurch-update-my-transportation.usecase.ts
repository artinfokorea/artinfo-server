import { Inject, Injectable } from '@nestjs/common';
import {
  ONCHURCH_TRANSPORTATION_REPOSITORY,
  IOnchurchTransportationRepository,
} from '@/onchurch/transportation/domain/repository/onchurch-transportation.repository.interface';
import { ONCHURCH_CHURCH_REPOSITORY, IOnchurchChurchRepository } from '@/onchurch/church/domain/repository/onchurch-church.repository.interface';
import { OnchurchTransportation } from '@/onchurch/transportation/domain/entity/onchurch-transportation.entity';
import { OnchurchTransportationWriteCommand } from '@/onchurch/transportation/application/command/onchurch-transportation-write.command';
import {
  OnchurchTransportationChurchNotConfigured,
  OnchurchTransportationNotFound,
} from '@/onchurch/transportation/domain/exception/onchurch-transportation.exception';

@Injectable()
export class OnchurchUpdateMyTransportationUseCase {
  constructor(
    @Inject(ONCHURCH_TRANSPORTATION_REPOSITORY)
    private readonly repo: IOnchurchTransportationRepository,

    @Inject(ONCHURCH_CHURCH_REPOSITORY)
    private readonly churchRepository: IOnchurchChurchRepository,
  ) {}

  async execute(userId: number, id: number, command: OnchurchTransportationWriteCommand): Promise<OnchurchTransportation> {
    const church = await this.churchRepository.findByOwnerId(userId);
    if (!church) throw new OnchurchTransportationChurchNotConfigured();
    const owned = await this.repo.findOwnedById(church.id, id);
    if (!owned) throw new OnchurchTransportationNotFound();
    return this.repo.update(church.id, id, command);
  }
}
