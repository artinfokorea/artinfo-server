import { Inject, Injectable } from '@nestjs/common';
import { ONCHURCH_VISION_REPOSITORY, IOnchurchVisionRepository } from '@/onchurch/about/domain/repository/onchurch-vision.repository.interface';
import { ONCHURCH_CHURCH_REPOSITORY, IOnchurchChurchRepository } from '@/onchurch/church/domain/repository/onchurch-church.repository.interface';
import { OnchurchVision } from '@/onchurch/about/domain/entity/onchurch-vision.entity';
import { OnchurchVisionWriteCommand } from '@/onchurch/about/application/command/onchurch-about-write.command';
import { OnchurchAboutChurchNotConfigured, OnchurchVisionNotFound } from '@/onchurch/about/domain/exception/onchurch-about.exception';

@Injectable()
export class OnchurchListMyVisionsUseCase {
  constructor(
    @Inject(ONCHURCH_VISION_REPOSITORY) private readonly repo: IOnchurchVisionRepository,
    @Inject(ONCHURCH_CHURCH_REPOSITORY) private readonly churchRepo: IOnchurchChurchRepository,
  ) {}
  async execute(userId: number): Promise<OnchurchVision[]> {
    const church = await this.churchRepo.findByOwnerId(userId);
    if (!church) return [];
    return this.repo.findAllByChurchId(church.id);
  }
}

@Injectable()
export class OnchurchCreateMyVisionUseCase {
  constructor(
    @Inject(ONCHURCH_VISION_REPOSITORY) private readonly repo: IOnchurchVisionRepository,
    @Inject(ONCHURCH_CHURCH_REPOSITORY) private readonly churchRepo: IOnchurchChurchRepository,
  ) {}
  async execute(userId: number, command: OnchurchVisionWriteCommand): Promise<OnchurchVision> {
    const church = await this.churchRepo.findByOwnerId(userId);
    if (!church) throw new OnchurchAboutChurchNotConfigured();
    return this.repo.create(church.id, command);
  }
}

@Injectable()
export class OnchurchUpdateMyVisionUseCase {
  constructor(
    @Inject(ONCHURCH_VISION_REPOSITORY) private readonly repo: IOnchurchVisionRepository,
    @Inject(ONCHURCH_CHURCH_REPOSITORY) private readonly churchRepo: IOnchurchChurchRepository,
  ) {}
  async execute(userId: number, id: number, command: OnchurchVisionWriteCommand): Promise<OnchurchVision> {
    const church = await this.churchRepo.findByOwnerId(userId);
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
    @Inject(ONCHURCH_CHURCH_REPOSITORY) private readonly churchRepo: IOnchurchChurchRepository,
  ) {}
  async execute(userId: number, id: number): Promise<void> {
    const church = await this.churchRepo.findByOwnerId(userId);
    if (!church) throw new OnchurchAboutChurchNotConfigured();
    const owned = await this.repo.findOwnedById(church.id, id);
    if (!owned) throw new OnchurchVisionNotFound();
    await this.repo.remove(church.id, id);
  }
}
