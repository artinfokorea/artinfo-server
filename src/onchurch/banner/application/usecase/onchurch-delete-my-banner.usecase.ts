import { Inject, Injectable } from '@nestjs/common';
import { ONCHURCH_BANNER_REPOSITORY, IOnchurchBannerRepository } from '@/onchurch/banner/domain/repository/onchurch-banner.repository.interface';
import { OnchurchChurchManagerResolver } from '@/onchurch/church/application/service/onchurch-church-manager.resolver';
import { OnchurchBannerNotFound, OnchurchChurchNotConfigured } from '@/onchurch/banner/domain/exception/onchurch-banner.exception';

@Injectable()
export class OnchurchDeleteMyBannerUseCase {
  constructor(
    @Inject(ONCHURCH_BANNER_REPOSITORY)
    private readonly bannerRepository: IOnchurchBannerRepository,

    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}

  async execute(userId: number, bannerId: number): Promise<void> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) throw new OnchurchChurchNotConfigured();
    const owned = await this.bannerRepository.findOwnedById(church.id, bannerId);
    if (!owned) throw new OnchurchBannerNotFound();
    await this.bannerRepository.remove(church.id, bannerId);
  }
}
