import { Inject, Injectable } from '@nestjs/common';
import { ONCHURCH_HISTORY_REPOSITORY, IOnchurchHistoryRepository } from '@/onchurch/about/domain/repository/onchurch-history.repository.interface';
import { ONCHURCH_CHURCH_REPOSITORY, IOnchurchChurchRepository } from '@/onchurch/church/domain/repository/onchurch-church.repository.interface';
import { OnchurchHistory } from '@/onchurch/about/domain/entity/onchurch-history.entity';
import { OnchurchHistoryWriteCommand } from '@/onchurch/about/application/command/onchurch-about-write.command';
import { OnchurchAboutChurchNotConfigured, OnchurchHistoryNotFound } from '@/onchurch/about/domain/exception/onchurch-about.exception';

@Injectable()
export class OnchurchListMyHistoriesUseCase {
  constructor(
    @Inject(ONCHURCH_HISTORY_REPOSITORY) private readonly repo: IOnchurchHistoryRepository,
    @Inject(ONCHURCH_CHURCH_REPOSITORY) private readonly churchRepo: IOnchurchChurchRepository,
  ) {}
  async execute(userId: number): Promise<OnchurchHistory[]> {
    const church = await this.churchRepo.findByOwnerId(userId);
    if (!church) return [];
    return this.repo.findAllByChurchId(church.id);
  }
}

@Injectable()
export class OnchurchCreateMyHistoryUseCase {
  constructor(
    @Inject(ONCHURCH_HISTORY_REPOSITORY) private readonly repo: IOnchurchHistoryRepository,
    @Inject(ONCHURCH_CHURCH_REPOSITORY) private readonly churchRepo: IOnchurchChurchRepository,
  ) {}
  async execute(userId: number, command: OnchurchHistoryWriteCommand): Promise<OnchurchHistory> {
    const church = await this.churchRepo.findByOwnerId(userId);
    if (!church) throw new OnchurchAboutChurchNotConfigured();
    return this.repo.create(church.id, command);
  }
}

@Injectable()
export class OnchurchUpdateMyHistoryUseCase {
  constructor(
    @Inject(ONCHURCH_HISTORY_REPOSITORY) private readonly repo: IOnchurchHistoryRepository,
    @Inject(ONCHURCH_CHURCH_REPOSITORY) private readonly churchRepo: IOnchurchChurchRepository,
  ) {}
  async execute(userId: number, id: number, command: OnchurchHistoryWriteCommand): Promise<OnchurchHistory> {
    const church = await this.churchRepo.findByOwnerId(userId);
    if (!church) throw new OnchurchAboutChurchNotConfigured();
    const owned = await this.repo.findOwnedById(church.id, id);
    if (!owned) throw new OnchurchHistoryNotFound();
    return this.repo.update(church.id, id, command);
  }
}

@Injectable()
export class OnchurchDeleteMyHistoryUseCase {
  constructor(
    @Inject(ONCHURCH_HISTORY_REPOSITORY) private readonly repo: IOnchurchHistoryRepository,
    @Inject(ONCHURCH_CHURCH_REPOSITORY) private readonly churchRepo: IOnchurchChurchRepository,
  ) {}
  async execute(userId: number, id: number): Promise<void> {
    const church = await this.churchRepo.findByOwnerId(userId);
    if (!church) throw new OnchurchAboutChurchNotConfigured();
    const owned = await this.repo.findOwnedById(church.id, id);
    if (!owned) throw new OnchurchHistoryNotFound();
    await this.repo.remove(church.id, id);
  }
}
