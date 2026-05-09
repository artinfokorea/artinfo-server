import { Inject, Injectable } from '@nestjs/common';
import {
  ONCHURCH_WORSHIP_SERVICE_REPOSITORY,
  IOnchurchWorshipServiceRepository,
} from '@/onchurch/worship/domain/repository/onchurch-worship-service.repository.interface';
import {
  ONCHURCH_WORSHIP_ORDER_REPOSITORY,
  IOnchurchWorshipOrderRepository,
} from '@/onchurch/worship/domain/repository/onchurch-worship-order.repository.interface';
import { ONCHURCH_CHURCH_REPOSITORY, IOnchurchChurchRepository } from '@/onchurch/church/domain/repository/onchurch-church.repository.interface';
import { OnchurchWorshipService } from '@/onchurch/worship/domain/entity/onchurch-worship-service.entity';
import { OnchurchWorshipOrder } from '@/onchurch/worship/domain/entity/onchurch-worship-order.entity';

export interface PublicWorshipView {
  services: OnchurchWorshipService[];
  orders: OnchurchWorshipOrder[];
}

@Injectable()
export class OnchurchListPublicWorshipUseCase {
  constructor(
    @Inject(ONCHURCH_WORSHIP_SERVICE_REPOSITORY) private readonly serviceRepo: IOnchurchWorshipServiceRepository,
    @Inject(ONCHURCH_WORSHIP_ORDER_REPOSITORY) private readonly orderRepo: IOnchurchWorshipOrderRepository,
    @Inject(ONCHURCH_CHURCH_REPOSITORY) private readonly churchRepo: IOnchurchChurchRepository,
  ) {}

  async execute(slug: string): Promise<PublicWorshipView> {
    const church = await this.churchRepo.findBySlug(slug);
    if (!church) return { services: [], orders: [] };
    const [services, orders] = await Promise.all([
      this.serviceRepo.findActiveByChurchId(church.id),
      this.orderRepo.findActiveByChurchId(church.id),
    ]);
    return { services, orders };
  }
}
