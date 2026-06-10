import { Inject, Injectable } from '@nestjs/common';
import { ONCHURCH_BANNER_REPOSITORY, IOnchurchBannerRepository } from '@/onchurch/banner/domain/repository/onchurch-banner.repository.interface';
import { OnchurchChurchManagerResolver } from '@/onchurch/church/application/service/onchurch-church-manager.resolver';
import { OnchurchBanner } from '@/onchurch/banner/domain/entity/onchurch-banner.entity';
import { OnchurchBannerWriteCommand } from '@/onchurch/banner/application/command/onchurch-banner-write.command';
import { OnchurchChurchNotConfigured } from '@/onchurch/banner/domain/exception/onchurch-banner.exception';

@Injectable()
export class OnchurchCreateMyBannerUseCase {
  constructor(
    @Inject(ONCHURCH_BANNER_REPOSITORY)
    private readonly bannerRepository: IOnchurchBannerRepository,

    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}

  async execute(userId: number, command: OnchurchBannerWriteCommand): Promise<OnchurchBanner> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) throw new OnchurchChurchNotConfigured();
    return this.bannerRepository.create(church.id, command);
  }
}
