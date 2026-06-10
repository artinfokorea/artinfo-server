import { Inject, Injectable } from '@nestjs/common';
import { ONCHURCH_VISION_REPOSITORY, IOnchurchVisionRepository } from '@/onchurch/about/domain/repository/onchurch-vision.repository.interface';
import { OnchurchChurchManagerResolver } from '@/onchurch/church/application/service/onchurch-church-manager.resolver';
import { OnchurchVision } from '@/onchurch/about/domain/entity/onchurch-vision.entity';
import { OnchurchVisionWriteCommand } from '@/onchurch/about/application/command/onchurch-about-write.command';
import { OnchurchAboutChurchNotConfigured, OnchurchVisionNotFound } from '@/onchurch/about/domain/exception/onchurch-about.exception';

@Injectable()
export class OnchurchListMyVisionsUseCase {
  constructor(
    @Inject(ONCHURCH_VISION_REPOSITORY) private readonly repo: IOnchurchVisionRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}
  async execute(userId: number): Promise<OnchurchVision[]> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) return [];
    return this.repo.findAllByChurchId(church.id);
  }
}

@Injectable()
export class OnchurchCreateMyVisionUseCase {
  constructor(
    @Inject(ONCHURCH_VISION_REPOSITORY) private readonly repo: IOnchurchVisionRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}
  async execute(userId: number, command: OnchurchVisionWriteCommand): Promise<OnchurchVision> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) throw new OnchurchAboutChurchNotConfigured();
    return this.repo.create(church.id, command);
  }
}

@Injectable()
export class OnchurchUpdateMyVisionUseCase {
  constructor(
    @Inject(ONCHURCH_VISION_REPOSITORY) private readonly repo: IOnchurchVisionRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}
  async execute(userId: number, id: number, command: OnchurchVisionWriteCommand): Promise<OnchurchVision> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) throw new OnchurchAboutChurchNotConfigured();
    const owned = await this.repo.findOwnedById(church.id, id);
    if (!owned) throw new OnchurchVisionNotFound();
    return this.repo.update(church.id, id, command);
  }
}

@Injectable()
export class OnchurchDeleteMyVisionUseCase {
  constructor(
    @Inject(ONCHURCH_VISION_REPOSITORY) private readonly repo: IOnchurchVisionRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}
  async execute(userId: number, id: number): Promise<void> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) throw new OnchurchAboutChurchNotConfigured();
    const owned = await this.repo.findOwnedById(church.id, id);
    if (!owned) throw new OnchurchVisionNotFound();
    await this.repo.remove(church.id, id);
  }
}
