import { Inject, Injectable } from '@nestjs/common';
import {
  ONCHURCH_SERMON_SERIES_REPOSITORY,
  IOnchurchSermonSeriesRepository,
} from '@/onchurch/sermon/domain/repository/onchurch-sermon-series.repository.interface';
import { ONCHURCH_CHURCH_REPOSITORY, IOnchurchChurchRepository } from '@/onchurch/church/domain/repository/onchurch-church.repository.interface';
import { OnchurchSermonSeries } from '@/onchurch/sermon/domain/entity/onchurch-sermon-series.entity';
import { OnchurchSermonSeriesWriteCommand } from '@/onchurch/sermon/application/command/onchurch-sermon-write.command';
import { OnchurchSermonChurchNotConfigured, OnchurchSermonSeriesNotFound } from '@/onchurch/sermon/domain/exception/onchurch-sermon.exception';

@Injectable()
export class OnchurchListMySermonSeriesUseCase {
  constructor(
    @Inject(ONCHURCH_SERMON_SERIES_REPOSITORY) private readonly repo: IOnchurchSermonSeriesRepository,
    @Inject(ONCHURCH_CHURCH_REPOSITORY) private readonly churchRepo: IOnchurchChurchRepository,
  ) {}
  async execute(userId: number): Promise<OnchurchSermonSeries[]> {
    const church = await this.churchRepo.findByOwnerId(userId);
    if (!church) return [];
    return this.repo.findAllByChurchId(church.id);
  }
}

@Injectable()
export class OnchurchCreateMySermonSeriesUseCase {
  constructor(
    @Inject(ONCHURCH_SERMON_SERIES_REPOSITORY) private readonly repo: IOnchurchSermonSeriesRepository,
    @Inject(ONCHURCH_CHURCH_REPOSITORY) private readonly churchRepo: IOnchurchChurchRepository,
  ) {}
  async execute(userId: number, command: OnchurchSermonSeriesWriteCommand): Promise<OnchurchSermonSeries> {
    const church = await this.churchRepo.findByOwnerId(userId);
    if (!church) throw new OnchurchSermonChurchNotConfigured();
    return this.repo.create(church.id, command);
  }
}

@Injectable()
export class OnchurchUpdateMySermonSeriesUseCase {
  constructor(
    @Inject(ONCHURCH_SERMON_SERIES_REPOSITORY) private readonly repo: IOnchurchSermonSeriesRepository,
    @Inject(ONCHURCH_CHURCH_REPOSITORY) private readonly churchRepo: IOnchurchChurchRepository,
  ) {}
  async execute(userId: number, id: number, command: OnchurchSermonSeriesWriteCommand): Promise<OnchurchSermonSeries> {
    const church = await this.churchRepo.findByOwnerId(userId);
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
    @Inject(ONCHURCH_CHURCH_REPOSITORY) private readonly churchRepo: IOnchurchChurchRepository,
  ) {}
  async execute(userId: number, id: number): Promise<void> {
    const church = await this.churchRepo.findByOwnerId(userId);
    if (!church) throw new OnchurchSermonChurchNotConfigured();
    const owned = await this.repo.findOwnedById(church.id, id);
    if (!owned) throw new OnchurchSermonSeriesNotFound();
    await this.repo.remove(church.id, id);
  }
}
