import { Inject, Injectable } from '@nestjs/common';
import {
  ONCHURCH_WORSHIP_ORDER_REPOSITORY,
  IOnchurchWorshipOrderRepository,
} from '@/onchurch/worship/domain/repository/onchurch-worship-order.repository.interface';
import { OnchurchChurchManagerResolver } from '@/onchurch/church/application/service/onchurch-church-manager.resolver';
import { OnchurchWorshipOrder } from '@/onchurch/worship/domain/entity/onchurch-worship-order.entity';
import { OnchurchWorshipOrderWriteCommand } from '@/onchurch/worship/application/command/onchurch-worship-write.command';
import {
  OnchurchWorshipChurchNotConfigured,
  OnchurchWorshipOrderNotFound,
} from '@/onchurch/worship/domain/exception/onchurch-worship.exception';

@Injectable()
export class OnchurchListMyWorshipOrdersUseCase {
  constructor(
    @Inject(ONCHURCH_WORSHIP_ORDER_REPOSITORY) private readonly repo: IOnchurchWorshipOrderRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}
  async execute(userId: number): Promise<OnchurchWorshipOrder[]> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) return [];
    return this.repo.findAllByChurchId(church.id);
  }
}

@Injectable()
export class OnchurchCreateMyWorshipOrderUseCase {
  constructor(
    @Inject(ONCHURCH_WORSHIP_ORDER_REPOSITORY) private readonly repo: IOnchurchWorshipOrderRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}
  async execute(userId: number, command: OnchurchWorshipOrderWriteCommand): Promise<OnchurchWorshipOrder> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) throw new OnchurchWorshipChurchNotConfigured();
    return this.repo.create(church.id, command);
  }
}

@Injectable()
export class OnchurchUpdateMyWorshipOrderUseCase {
  constructor(
    @Inject(ONCHURCH_WORSHIP_ORDER_REPOSITORY) private readonly repo: IOnchurchWorshipOrderRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}
  async execute(userId: number, id: number, command: OnchurchWorshipOrderWriteCommand): Promise<OnchurchWorshipOrder> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) throw new OnchurchWorshipChurchNotConfigured();
    const owned = await this.repo.findOwnedById(church.id, id);
    if (!owned) throw new OnchurchWorshipOrderNotFound();
    return this.repo.update(church.id, id, command);
  }
}

@Injectable()
export class OnchurchDeleteMyWorshipOrderUseCase {
  constructor(
    @Inject(ONCHURCH_WORSHIP_ORDER_REPOSITORY) private readonly repo: IOnchurchWorshipOrderRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}
  async execute(userId: number, id: number): Promise<void> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) throw new OnchurchWorshipChurchNotConfigured();
    const owned = await this.repo.findOwnedById(church.id, id);
    if (!owned) throw new OnchurchWorshipOrderNotFound();
    await this.repo.remove(church.id, id);
  }
}
