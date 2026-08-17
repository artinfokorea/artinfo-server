import { Inject, Injectable } from '@nestjs/common';
import { ONCHURCH_BANNER_REPOSITORY, IOnchurchBannerRepository } from '@/onchurch/banner/domain/repository/onchurch-banner.repository.interface';
import { OnchurchChurchManagerResolver } from '@/onchurch/church/application/service/onchurch-church-manager.resolver';
import { OnchurchBanner } from '@/onchurch/banner/domain/entity/onchurch-banner.entity';

@Injectable()
export class OnchurchListMyBannersUseCase {
  constructor(
    @Inject(ONCHURCH_BANNER_REPOSITORY)
    private readonly bannerRepository: IOnchurchBannerRepository,

    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}

  async execute(userId: number): Promise<{ bannerType: string; banners: OnchurchBanner[] }> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) return { bannerType: 'image', banners: [] };
    const banners = await this.bannerRepository.findAllByChurchId(church.id);
    return { bannerType: church.bannerType, banners };
  }
}
