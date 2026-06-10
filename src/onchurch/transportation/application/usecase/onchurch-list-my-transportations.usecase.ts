import { Inject, Injectable } from '@nestjs/common';
import {
  ONCHURCH_TRANSPORTATION_REPOSITORY,
  IOnchurchTransportationRepository,
} from '@/onchurch/transportation/domain/repository/onchurch-transportation.repository.interface';
import { OnchurchChurchManagerResolver } from '@/onchurch/church/application/service/onchurch-church-manager.resolver';
import { OnchurchTransportation } from '@/onchurch/transportation/domain/entity/onchurch-transportation.entity';

@Injectable()
export class OnchurchListMyTransportationsUseCase {
  constructor(
    @Inject(ONCHURCH_TRANSPORTATION_REPOSITORY)
    private readonly repo: IOnchurchTransportationRepository,

    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}

  async execute(userId: number): Promise<OnchurchTransportation[]> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) return [];
    return this.repo.findAllByChurchId(church.id);
  }
}
