import { Inject, Injectable } from '@nestjs/common';
import { ONCHURCH_NOTICE_REPOSITORY, IOnchurchNoticeRepository } from '@/onchurch/notice/domain/repository/onchurch-notice.repository.interface';
import { ONCHURCH_CHURCH_REPOSITORY, IOnchurchChurchRepository } from '@/onchurch/church/domain/repository/onchurch-church.repository.interface';
import { OnchurchNotice } from '@/onchurch/notice/domain/entity/onchurch-notice.entity';

@Injectable()
export class OnchurchListPublicNoticesUseCase {
  constructor(
    @Inject(ONCHURCH_NOTICE_REPOSITORY)
    private readonly noticeRepository: IOnchurchNoticeRepository,

    @Inject(ONCHURCH_CHURCH_REPOSITORY)
    private readonly churchRepository: IOnchurchChurchRepository,
  ) {}

  async execute(slug: string, params: { category?: string; keyword?: string; page: number; size: number }): Promise<{ items: OnchurchNotice[]; totalCount: number }> {
    const church = await this.churchRepository.findBySlug(slug);
    if (!church) return { items: [], totalCount: 0 };
    const skip = Math.max(0, (params.page - 1) * params.size);
    const take = Math.min(100, Math.max(1, params.size));
    return this.noticeRepository.findActivePagedByChurchId(church.id, {
      category: params.category,
      keyword: params.keyword,
      skip,
      take,
    });
  }
}
