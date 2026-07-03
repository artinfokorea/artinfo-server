import { Inject, Injectable } from '@nestjs/common';
import { ONCHURCH_BANNER_REPOSITORY, IOnchurchBannerRepository } from '@/onchurch/banner/domain/repository/onchurch-banner.repository.interface';
import { ONCHURCH_CHURCH_REPOSITORY, IOnchurchChurchRepository } from '@/onchurch/church/domain/repository/onchurch-church.repository.interface';

const DEFAULT_BANNER_IMAGE_URL =
  'https://artinfo.s3.ap-northeast-2.amazonaws.com/prod/upload/4637/images/20260703/original/l4lj_M38dun.1783117768493.webp';

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
      return [this.buildDefault()];
    }

    const banners = await this.bannerRepository.findActiveByChurchId(church.id);
    if (banners.length === 0) {
      return [this.buildDefault()];
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

  // 기본 배너는 이미지만 노출한다(제목/설명 없음 → 프론트에서 텍스트 오버레이 미표시).
  private buildDefault(): PublicBannerView {
    return { id: null, title: '', description: null, imageUrl: DEFAULT_BANNER_IMAGE_URL, linkUrl: null, isDefault: true };
  }
}
