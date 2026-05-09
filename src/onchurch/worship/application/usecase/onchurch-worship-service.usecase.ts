import { Inject, Injectable } from '@nestjs/common';
import {
  ONCHURCH_WORSHIP_SERVICE_REPOSITORY,
  IOnchurchWorshipServiceRepository,
} from '@/onchurch/worship/domain/repository/onchurch-worship-service.repository.interface';
import { ONCHURCH_CHURCH_REPOSITORY, IOnchurchChurchRepository } from '@/onchurch/church/domain/repository/onchurch-church.repository.interface';
import { OnchurchWorshipService } from '@/onchurch/worship/domain/entity/onchurch-worship-service.entity';
import { OnchurchWorshipServiceWriteCommand } from '@/onchurch/worship/application/command/onchurch-worship-write.command';
import {
  OnchurchWorshipChurchNotConfigured,
  OnchurchWorshipServiceNotFound,
} from '@/onchurch/worship/domain/exception/onchurch-worship.exception';

@Injectable()
export class OnchurchListMyWorshipServicesUseCase {
  constructor(
    @Inject(ONCHURCH_WORSHIP_SERVICE_REPOSITORY) private readonly repo: IOnchurchWorshipServiceRepository,
    @Inject(ONCHURCH_CHURCH_REPOSITORY) private readonly churchRepo: IOnchurchChurchRepository,
  ) {}
  async execute(userId: number): Promise<OnchurchWorshipService[]> {
    const church = await this.churchRepo.findByOwnerId(userId);
    if (!church) return [];
    return this.repo.findAllByChurchId(church.id);
  }
}

@Injectable()
export class OnchurchCreateMyWorshipServiceUseCase {
  constructor(
    @Inject(ONCHURCH_WORSHIP_SERVICE_REPOSITORY) private readonly repo: IOnchurchWorshipServiceRepository,
    @Inject(ONCHURCH_CHURCH_REPOSITORY) private readonly churchRepo: IOnchurchChurchRepository,
  ) {}
  async execute(userId: number, command: OnchurchWorshipServiceWriteCommand): Promise<OnchurchWorshipService> {
    const church = await this.churchRepo.findByOwnerId(userId);
    if (!church) throw new OnchurchWorshipChurchNotConfigured();
    return this.repo.create(church.id, command);
  }
}

@Injectable()
export class OnchurchUpdateMyWorshipServiceUseCase {
  constructor(
    @Inject(ONCHURCH_WORSHIP_SERVICE_REPOSITORY) private readonly repo: IOnchurchWorshipServiceRepository,
    @Inject(ONCHURCH_CHURCH_REPOSITORY) private readonly churchRepo: IOnchurchChurchRepository,
  ) {}
  async execute(userId: number, id: number, command: OnchurchWorshipServiceWriteCommand): Promise<OnchurchWorshipService> {
    const church = await this.churchRepo.findByOwnerId(userId);
    if (!church) throw new OnchurchWorshipChurchNotConfigured();
    const owned = await this.repo.findOwnedById(church.id, id);
    if (!owned) throw new OnchurchWorshipServiceNotFound();
    return this.repo.update(church.id, id, command);
  }
}

@Injectable()
export class OnchurchDeleteMyWorshipServiceUseCase {
  constructor(
    @Inject(ONCHURCH_WORSHIP_SERVICE_REPOSITORY) private readonly repo: IOnchurchWorshipServiceRepository,
    @Inject(ONCHURCH_CHURCH_REPOSITORY) private readonly churchRepo: IOnchurchChurchRepository,
  ) {}
  async execute(userId: number, id: number): Promise<void> {
    const church = await this.churchRepo.findByOwnerId(userId);
    if (!church) throw new OnchurchWorshipChurchNotConfigured();
    const owned = await this.repo.findOwnedById(church.id, id);
    if (!owned) throw new OnchurchWorshipServiceNotFound();
    await this.repo.remove(church.id, id);
  }
}
