import { Inject, Injectable } from '@nestjs/common';
import {
  ONCHURCH_SAINT_PRAYER_REPOSITORY,
  IOnchurchSaintPrayerRepository,
} from '@/onchurch/saint/domain/repository/onchurch-saint-prayer.repository.interface';
import {
  ONCHURCH_SAINT_REPOSITORY,
  IOnchurchSaintRepository,
} from '@/onchurch/saint/domain/repository/onchurch-saint.repository.interface';
import { OnchurchChurchManagerResolver } from '@/onchurch/church/application/service/onchurch-church-manager.resolver';
import { OnchurchSaintPrayer } from '@/onchurch/saint/domain/entity/onchurch-saint-prayer.entity';
import {
  OnchurchSaintChurchNotConfigured,
  OnchurchSaintNotFound,
  OnchurchSaintPrayerNotFound,
} from '@/onchurch/saint/domain/exception/onchurch-saint.exception';

@Injectable()
export class OnchurchListMySaintPrayersUseCase {
  constructor(
    @Inject(ONCHURCH_SAINT_PRAYER_REPOSITORY) private readonly prayerRepo: IOnchurchSaintPrayerRepository,
    @Inject(ONCHURCH_SAINT_REPOSITORY) private readonly saintRepo: IOnchurchSaintRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}
  async execute(userId: number, saintId: number): Promise<OnchurchSaintPrayer[]> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) return [];
    const owned = await this.saintRepo.findOwnedById(church.id, saintId);
    if (!owned) throw new OnchurchSaintNotFound();
    return this.prayerRepo.findBySaintId(church.id, saintId);
  }
}

@Injectable()
export class OnchurchCreateMySaintPrayerUseCase {
  constructor(
    @Inject(ONCHURCH_SAINT_PRAYER_REPOSITORY) private readonly prayerRepo: IOnchurchSaintPrayerRepository,
    @Inject(ONCHURCH_SAINT_REPOSITORY) private readonly saintRepo: IOnchurchSaintRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}
  async execute(userId: number, saintId: number, content: string): Promise<OnchurchSaintPrayer> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) throw new OnchurchSaintChurchNotConfigured();
    const owned = await this.saintRepo.findOwnedById(church.id, saintId);
    if (!owned) throw new OnchurchSaintNotFound();
    return this.prayerRepo.create(church.id, saintId, content);
  }
}

@Injectable()
export class OnchurchDeleteMySaintPrayerUseCase {
  constructor(
    @Inject(ONCHURCH_SAINT_PRAYER_REPOSITORY) private readonly prayerRepo: IOnchurchSaintPrayerRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}
  async execute(userId: number, prayerId: number): Promise<void> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) throw new OnchurchSaintChurchNotConfigured();
    const owned = await this.prayerRepo.findOwnedById(church.id, prayerId);
    if (!owned) throw new OnchurchSaintPrayerNotFound();
    await this.prayerRepo.remove(church.id, prayerId);
  }
}
