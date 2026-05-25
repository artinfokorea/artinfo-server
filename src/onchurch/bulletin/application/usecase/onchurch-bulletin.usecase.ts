import { Inject, Injectable } from '@nestjs/common';
import {
  ONCHURCH_BULLETIN_REPOSITORY,
  IOnchurchBulletinRepository,
} from '@/onchurch/bulletin/domain/repository/onchurch-bulletin.repository.interface';
import { ONCHURCH_CHURCH_REPOSITORY, IOnchurchChurchRepository } from '@/onchurch/church/domain/repository/onchurch-church.repository.interface';
import { OnchurchBulletin } from '@/onchurch/bulletin/domain/entity/onchurch-bulletin.entity';
import { OnchurchBulletinWriteCommand } from '@/onchurch/bulletin/application/command/onchurch-bulletin-write.command';
import { OnchurchBulletinChurchNotConfigured } from '@/onchurch/bulletin/domain/exception/onchurch-bulletin.exception';

@Injectable()
export class OnchurchScanMyBulletinUseCase {
  constructor(
    @Inject(ONCHURCH_BULLETIN_REPOSITORY)
    private readonly bulletinRepository: IOnchurchBulletinRepository,
    @Inject(ONCHURCH_CHURCH_REPOSITORY)
    private readonly churchRepository: IOnchurchChurchRepository,
  ) {}

  async execute(userId: number): Promise<OnchurchBulletin | null> {
    const church = await this.churchRepository.findByOwnerId(userId);
    if (!church) return null;
    return this.bulletinRepository.findByChurchId(church.id);
  }
}

@Injectable()
export class OnchurchUpsertMyBulletinUseCase {
  constructor(
    @Inject(ONCHURCH_BULLETIN_REPOSITORY)
    private readonly bulletinRepository: IOnchurchBulletinRepository,
    @Inject(ONCHURCH_CHURCH_REPOSITORY)
    private readonly churchRepository: IOnchurchChurchRepository,
  ) {}

  async execute(userId: number, command: OnchurchBulletinWriteCommand): Promise<OnchurchBulletin> {
    const church = await this.churchRepository.findByOwnerId(userId);
    if (!church) throw new OnchurchBulletinChurchNotConfigured();
    return this.bulletinRepository.upsertByChurchId(church.id, command);
  }
}
