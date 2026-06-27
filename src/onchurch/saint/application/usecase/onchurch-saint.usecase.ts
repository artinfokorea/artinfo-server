import { Inject, Injectable } from '@nestjs/common';
import {
  ONCHURCH_SAINT_REPOSITORY,
  IOnchurchSaintRepository,
} from '@/onchurch/saint/domain/repository/onchurch-saint.repository.interface';
import {
  ONCHURCH_SAINT_RELATION_REPOSITORY,
  IOnchurchSaintRelationRepository,
} from '@/onchurch/saint/domain/repository/onchurch-saint-relation.repository.interface';
import {
  ONCHURCH_SAINT_PRAYER_REPOSITORY,
  IOnchurchSaintPrayerRepository,
} from '@/onchurch/saint/domain/repository/onchurch-saint-prayer.repository.interface';
import { OnchurchChurchManagerResolver } from '@/onchurch/church/application/service/onchurch-church-manager.resolver';
import { OnchurchSaint } from '@/onchurch/saint/domain/entity/onchurch-saint.entity';
import { OnchurchSaintWriteCommand } from '@/onchurch/saint/application/command/onchurch-saint-write.command';
import {
  OnchurchSaintChurchNotConfigured,
  OnchurchSaintNotFound,
} from '@/onchurch/saint/domain/exception/onchurch-saint.exception';

@Injectable()
export class OnchurchListMySaintsUseCase {
  constructor(
    @Inject(ONCHURCH_SAINT_REPOSITORY) private readonly repo: IOnchurchSaintRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}
  async execute(userId: number): Promise<OnchurchSaint[]> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) return [];
    return this.repo.findAllByChurchId(church.id);
  }
}

@Injectable()
export class OnchurchCreateMySaintUseCase {
  constructor(
    @Inject(ONCHURCH_SAINT_REPOSITORY) private readonly repo: IOnchurchSaintRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}
  async execute(userId: number, command: OnchurchSaintWriteCommand): Promise<OnchurchSaint> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) throw new OnchurchSaintChurchNotConfigured();
    return this.repo.create(church.id, command);
  }
}

@Injectable()
export class OnchurchUpdateMySaintUseCase {
  constructor(
    @Inject(ONCHURCH_SAINT_REPOSITORY) private readonly repo: IOnchurchSaintRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}
  async execute(userId: number, id: number, command: OnchurchSaintWriteCommand): Promise<OnchurchSaint> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) throw new OnchurchSaintChurchNotConfigured();
    const owned = await this.repo.findOwnedById(church.id, id);
    if (!owned) throw new OnchurchSaintNotFound();
    return this.repo.update(church.id, id, command);
  }
}

@Injectable()
export class OnchurchUpdateMySaintMemoUseCase {
  constructor(
    @Inject(ONCHURCH_SAINT_REPOSITORY) private readonly repo: IOnchurchSaintRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}
  async execute(userId: number, id: number, memo: string | null): Promise<OnchurchSaint> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) throw new OnchurchSaintChurchNotConfigured();
    const owned = await this.repo.findOwnedById(church.id, id);
    if (!owned) throw new OnchurchSaintNotFound();
    return this.repo.updateMemo(church.id, id, memo);
  }
}

@Injectable()
export class OnchurchUpdateMySaintFavoriteUseCase {
  constructor(
    @Inject(ONCHURCH_SAINT_REPOSITORY) private readonly repo: IOnchurchSaintRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}
  async execute(userId: number, id: number, isFavorite: boolean): Promise<OnchurchSaint> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) throw new OnchurchSaintChurchNotConfigured();
    const owned = await this.repo.findOwnedById(church.id, id);
    if (!owned) throw new OnchurchSaintNotFound();
    return this.repo.updateFavorite(church.id, id, isFavorite);
  }
}

@Injectable()
export class OnchurchDeleteMySaintUseCase {
  constructor(
    @Inject(ONCHURCH_SAINT_REPOSITORY) private readonly repo: IOnchurchSaintRepository,
    @Inject(ONCHURCH_SAINT_RELATION_REPOSITORY) private readonly relationRepo: IOnchurchSaintRelationRepository,
    @Inject(ONCHURCH_SAINT_PRAYER_REPOSITORY) private readonly prayerRepo: IOnchurchSaintPrayerRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}
  async execute(userId: number, id: number): Promise<void> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) throw new OnchurchSaintChurchNotConfigured();
    const owned = await this.repo.findOwnedById(church.id, id);
    if (!owned) throw new OnchurchSaintNotFound();
    // 성도를 삭제하면 그 성도가 얽힌 모든 가족관계·기도목록도 함께 제거한다.
    await this.relationRepo.removeBySaintId(church.id, id);
    await this.prayerRepo.removeBySaintId(church.id, id);
    await this.repo.remove(church.id, id);
  }
}
