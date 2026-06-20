import { Inject, Injectable } from '@nestjs/common';
import { ONCHURCH_BANNER_REPOSITORY, IOnchurchBannerRepository } from '@/onchurch/banner/domain/repository/onchurch-banner.repository.interface';
import { ONCHURCH_CHURCH_REPOSITORY, IOnchurchChurchRepository } from '@/onchurch/church/domain/repository/onchurch-church.repository.interface';

const DEFAULT_BANNER_IMAGE_URL =
  'https://artinfo.s3.ap-northeast-2.amazonaws.com/prod/upload/4637/images/20260507/original/tncw9_mUrfv.1778160778436.jpeg';

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
      return [this.buildDefault('', '온교회와 함께 시작하세요.')];
    }

    const banners = await this.bannerRepository.findActiveByChurchId(church.id);
    if (banners.length === 0) {
      return [
        this.buildDefault(
          '',
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
    return { id: null, title, description, imageUrl: DEFAULT_BANNER_IMAGE_URL, linkUrl: null, isDefault: true };
  }
}
