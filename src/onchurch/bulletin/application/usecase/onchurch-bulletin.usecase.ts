import { Inject, Injectable } from '@nestjs/common';
import {
  ONCHURCH_BULLETIN_REPOSITORY,
  IOnchurchBulletinRepository,
} from '@/onchurch/bulletin/domain/repository/onchurch-bulletin.repository.interface';
import { OnchurchChurchManagerResolver } from '@/onchurch/church/application/service/onchurch-church-manager.resolver';
import { OnchurchBulletin } from '@/onchurch/bulletin/domain/entity/onchurch-bulletin.entity';
import { OnchurchBulletinWriteCommand } from '@/onchurch/bulletin/application/command/onchurch-bulletin-write.command';
import { OnchurchBulletinChurchNotConfigured } from '@/onchurch/bulletin/domain/exception/onchurch-bulletin.exception';

@Injectable()
export class OnchurchScanMyBulletinUseCase {
  constructor(
    @Inject(ONCHURCH_BULLETIN_REPOSITORY)
    private readonly bulletinRepository: IOnchurchBulletinRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}

  async execute(userId: number): Promise<OnchurchBulletin | null> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) return null;
    return this.bulletinRepository.findByChurchId(church.id);
  }
}

@Injectable()
export class OnchurchUpsertMyBulletinUseCase {
  constructor(
    @Inject(ONCHURCH_BULLETIN_REPOSITORY)
    private readonly bulletinRepository: IOnchurchBulletinRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}

  async execute(userId: number, command: OnchurchBulletinWriteCommand): Promise<OnchurchBulletin> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) throw new OnchurchBulletinChurchNotConfigured();
    return this.bulletinRepository.upsertByChurchId(church.id, command);
  }
}
