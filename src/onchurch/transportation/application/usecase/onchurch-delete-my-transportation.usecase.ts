import { Inject, Injectable } from '@nestjs/common';
import {
  ONCHURCH_TRANSPORTATION_REPOSITORY,
  IOnchurchTransportationRepository,
} from '@/onchurch/transportation/domain/repository/onchurch-transportation.repository.interface';
import { OnchurchChurchManagerResolver } from '@/onchurch/church/application/service/onchurch-church-manager.resolver';
import {
  OnchurchTransportationChurchNotConfigured,
  OnchurchTransportationNotFound,
} from '@/onchurch/transportation/domain/exception/onchurch-transportation.exception';

@Injectable()
export class OnchurchDeleteMyTransportationUseCase {
  constructor(
    @Inject(ONCHURCH_TRANSPORTATION_REPOSITORY)
    private readonly repo: IOnchurchTransportationRepository,

    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}

  async execute(userId: number, id: number): Promise<void> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) throw new OnchurchTransportationChurchNotConfigured();
    const owned = await this.repo.findOwnedById(church.id, id);
    if (!owned) throw new OnchurchTransportationNotFound();
    await this.repo.remove(church.id, id);
  }
}
