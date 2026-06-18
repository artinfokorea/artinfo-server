import { Inject, Injectable } from '@nestjs/common';
import {
  ONCHURCH_SERMON_SERIES_REPOSITORY,
  IOnchurchSermonSeriesRepository,
} from '@/onchurch/sermon/domain/repository/onchurch-sermon-series.repository.interface';
import { OnchurchChurchManagerResolver } from '@/onchurch/church/application/service/onchurch-church-manager.resolver';
import { OnchurchSermonSeries } from '@/onchurch/sermon/domain/entity/onchurch-sermon-series.entity';
import { OnchurchSermonSeriesWriteCommand } from '@/onchurch/sermon/application/command/onchurch-sermon-write.command';
import { OnchurchSermonChurchNotConfigured, OnchurchSermonSeriesNotFound } from '@/onchurch/sermon/domain/exception/onchurch-sermon.exception';

@Injectable()
export class OnchurchListMySermonSeriesUseCase {
  constructor(
    @Inject(ONCHURCH_SERMON_SERIES_REPOSITORY) private readonly repo: IOnchurchSermonSeriesRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}
  async execute(userId: number): Promise<OnchurchSermonSeries[]> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) return [];
    // 카테고리를 처음 열 때 '전체' 보기 카테고리를 자동 생성한다(이미 삭제했다면 재생성하지 않음).
    await this.repo.ensureAllCategory(church.id);
    return this.repo.findAllByChurchId(church.id);
  }
}

@Injectable()
export class OnchurchRestoreMySermonAllSeriesUseCase {
  constructor(
    @Inject(ONCHURCH_SERMON_SERIES_REPOSITORY) private readonly repo: IOnchurchSermonSeriesRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}
  async execute(userId: number): Promise<OnchurchSermonSeries[]> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) throw new OnchurchSermonChurchNotConfigured();
    await this.repo.restoreAllCategory(church.id);
    return this.repo.findAllByChurchId(church.id);
  }
}

@Injectable()
export class OnchurchCreateMySermonSeriesUseCase {
  constructor(
    @Inject(ONCHURCH_SERMON_SERIES_REPOSITORY) private readonly repo: IOnchurchSermonSeriesRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}
  async execute(userId: number, command: OnchurchSermonSeriesWriteCommand): Promise<OnchurchSermonSeries> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) throw new OnchurchSermonChurchNotConfigured();
    return this.repo.create(church.id, command);
  }
}

@Injectable()
export class OnchurchUpdateMySermonSeriesUseCase {
  constructor(
    @Inject(ONCHURCH_SERMON_SERIES_REPOSITORY) private readonly repo: IOnchurchSermonSeriesRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}
  async execute(userId: number, id: number, command: OnchurchSermonSeriesWriteCommand): Promise<OnchurchSermonSeries> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) throw new OnchurchSermonChurchNotConfigured();
    const owned = await this.repo.findOwnedById(church.id, id);
    if (!owned) throw new OnchurchSermonSeriesNotFound();
    return this.repo.update(church.id, id, command);
  }
}

@Injectable()
export class OnchurchDeleteMySermonSeriesUseCase {
  constructor(
    @Inject(ONCHURCH_SERMON_SERIES_REPOSITORY) private readonly repo: IOnchurchSermonSeriesRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}
  async execute(userId: number, id: number): Promise<void> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) throw new OnchurchSermonChurchNotConfigured();
    const owned = await this.repo.findOwnedById(church.id, id);
    if (!owned) throw new OnchurchSermonSeriesNotFound();
    await this.repo.remove(church.id, id);
  }
}
