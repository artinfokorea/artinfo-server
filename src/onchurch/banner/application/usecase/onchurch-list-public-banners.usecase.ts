import { Inject, Injectable } from '@nestjs/common';
import { ONCHURCH_BANNER_REPOSITORY, IOnchurchBannerRepository } from '@/onchurch/banner/domain/repository/onchurch-banner.repository.interface';
import { ONCHURCH_CHURCH_REPOSITORY, IOnchurchChurchRepository } from '@/onchurch/church/domain/repository/onchurch-church.repository.interface';

export interface PublicBannerView {
  id: number | null;
  title: string;
  description: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  isDefault: boolean;
}

@Injectable()
export class OnchurchListPublicBannersUseCase {
  constructor(
    @Inject(ONCHURCH_BANNER_REPOSITORY)
    private readonly bannerRepository: IOnchurchBannerRepository,

    @Inject(ONCHURCH_CHURCH_REPOSITORY)
    private readonly churchRepository: IOnchurchChurchRepository,
  ) {}

  async execute(slug: string): Promise<PublicBannerView[]> {
    const church = await this.churchRepository.findBySlug(slug);
    if (!church) {
      return [this.buildDefault('우리 교회에 오신 것을 환영합니다', '온교회와 함께 시작하세요.')];
    }

    const banners = await this.bannerRepository.findActiveByChurchId(church.id);
    if (banners.length === 0) {
      return [
        this.buildDefault(
          `${church.name}에 오신 것을 환영합니다`,
          church.tagline ?? '함께 예배하고 성장하는 공동체입니다.',
        ),
      ];
    }

    return banners.map(b => ({
      id: b.id,
      title: b.title,
      description: b.description,
      imageUrl: b.imageUrl,
      linkUrl: b.linkUrl,
      isDefault: false,
    }));
  }

  private buildDefault(title: string, description: string): PublicBannerView {
    return { id: null, title, description, imageUrl: null, linkUrl: null, isDefault: true };
  }
}
