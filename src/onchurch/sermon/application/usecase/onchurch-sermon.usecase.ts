import { Inject, Injectable } from '@nestjs/common';
import {
  ONCHURCH_SERMON_REPOSITORY,
  IOnchurchSermonRepository,
} from '@/onchurch/sermon/domain/repository/onchurch-sermon.repository.interface';
import { ONCHURCH_CHURCH_REPOSITORY, IOnchurchChurchRepository } from '@/onchurch/church/domain/repository/onchurch-church.repository.interface';
import { OnchurchSermon } from '@/onchurch/sermon/domain/entity/onchurch-sermon.entity';
import { OnchurchSermonWriteCommand } from '@/onchurch/sermon/application/command/onchurch-sermon-write.command';
import { OnchurchSermonChurchNotConfigured, OnchurchSermonNotFound } from '@/onchurch/sermon/domain/exception/onchurch-sermon.exception';

@Injectable()
export class OnchurchListMySermonsUseCase {
  constructor(
    @Inject(ONCHURCH_SERMON_REPOSITORY) private readonly repo: IOnchurchSermonRepository,
    @Inject(ONCHURCH_CHURCH_REPOSITORY) private readonly churchRepo: IOnchurchChurchRepository,
  ) {}
  async execute(userId: number): Promise<OnchurchSermon[]> {
    const church = await this.churchRepo.findByOwnerId(userId);
    if (!church) return [];
    return this.repo.findAllByChurchId(church.id);
  }
}

@Injectable()
export class OnchurchCreateMySermonUseCase {
  constructor(
    @Inject(ONCHURCH_SERMON_REPOSITORY) private readonly repo: IOnchurchSermonRepository,
    @Inject(ONCHURCH_CHURCH_REPOSITORY) private readonly churchRepo: IOnchurchChurchRepository,
  ) {}
  async execute(userId: number, command: OnchurchSermonWriteCommand): Promise<OnchurchSermon> {
    const church = await this.churchRepo.findByOwnerId(userId);
    if (!church) throw new OnchurchSermonChurchNotConfigured();
    return this.repo.create(church.id, command);
  }
}

@Injectable()
export class OnchurchUpdateMySermonUseCase {
  constructor(
    @Inject(ONCHURCH_SERMON_REPOSITORY) private readonly repo: IOnchurchSermonRepository,
    @Inject(ONCHURCH_CHURCH_REPOSITORY) private readonly churchRepo: IOnchurchChurchRepository,
  ) {}
  async execute(userId: number, id: number, command: OnchurchSermonWriteCommand): Promise<OnchurchSermon> {
    const church = await this.churchRepo.findByOwnerId(userId);
    if (!church) throw new OnchurchSermonChurchNotConfigured();
    const owned = await this.repo.findOwnedById(church.id, id);
    if (!owned) throw new OnchurchSermonNotFound();
    return this.repo.update(church.id, id, command);
  }
}

@Injectable()
export class OnchurchDeleteMySermonUseCase {
  constructor(
    @Inject(ONCHURCH_SERMON_REPOSITORY) private readonly repo: IOnchurchSermonRepository,
    @Inject(ONCHURCH_CHURCH_REPOSITORY) private readonly churchRepo: IOnchurchChurchRepository,
  ) {}
  async execute(userId: number, id: number): Promise<void> {
    const church = await this.churchRepo.findByOwnerId(userId);
    if (!church) throw new OnchurchSermonChurchNotConfigured();
    const owned = await this.repo.findOwnedById(church.id, id);
    if (!owned) throw new OnchurchSermonNotFound();
    await this.repo.remove(church.id, id);
  }
}
