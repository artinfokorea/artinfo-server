import { Inject, Injectable } from '@nestjs/common';
import { ONCHURCH_CHURCH_REPOSITORY, IOnchurchChurchRepository } from '@/onchurch/church/domain/repository/onchurch-church.repository.interface';
import { OnchurchChurchManagerResolver } from '@/onchurch/church/application/service/onchurch-church-manager.resolver';
import { OnchurchChurchNotConfigured } from '@/onchurch/banner/domain/exception/onchurch-banner.exception';

@Injectable()
export class OnchurchUpdateMyBannerTypeUseCase {
  constructor(
    @Inject(ONCHURCH_CHURCH_REPOSITORY)
    private readonly churchRepository: IOnchurchChurchRepository,

    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}

  async execute(userId: number, bannerType: 'image' | 'video'): Promise<void> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) throw new OnchurchChurchNotConfigured();
    await this.churchRepository.updateBannerType(church.id, bannerType);
  }
}
