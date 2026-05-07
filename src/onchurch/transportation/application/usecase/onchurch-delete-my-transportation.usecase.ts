import { Inject, Injectable } from '@nestjs/common';
import {
  ONCHURCH_TRANSPORTATION_REPOSITORY,
  IOnchurchTransportationRepository,
} from '@/onchurch/transportation/domain/repository/onchurch-transportation.repository.interface';
import { ONCHURCH_CHURCH_REPOSITORY, IOnchurchChurchRepository } from '@/onchurch/church/domain/repository/onchurch-church.repository.interface';
import {
  OnchurchTransportationChurchNotConfigured,
  OnchurchTransportationNotFound,
} from '@/onchurch/transportation/domain/exception/onchurch-transportation.exception';

@Injectable()
export class OnchurchDeleteMyTransportationUseCase {
  constructor(
    @Inject(ONCHURCH_TRANSPORTATION_REPOSITORY)
    private readonly repo: IOnchurchTransportationRepository,

    @Inject(ONCHURCH_CHURCH_REPOSITORY)
    private readonly churchRepository: IOnchurchChurchRepository,
  ) {}

  async execute(userId: number, id: number): Promise<void> {
    const church = await this.churchRepository.findByOwnerId(userId);
    if (!church) throw new OnchurchTransportationChurchNotConfigured();
    const owned = await this.repo.findOwnedById(church.id, id);
    if (!owned) throw new OnchurchTransportationNotFound();
    await this.repo.remove(church.id, id);
  }
}
