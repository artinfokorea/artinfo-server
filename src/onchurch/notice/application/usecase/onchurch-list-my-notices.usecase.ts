import { Inject, Injectable } from '@nestjs/common';
import { ONCHURCH_NOTICE_REPOSITORY, IOnchurchNoticeRepository } from '@/onchurch/notice/domain/repository/onchurch-notice.repository.interface';
import { ONCHURCH_CHURCH_REPOSITORY, IOnchurchChurchRepository } from '@/onchurch/church/domain/repository/onchurch-church.repository.interface';
import { OnchurchNotice } from '@/onchurch/notice/domain/entity/onchurch-notice.entity';

@Injectable()
export class OnchurchListMyNoticesUseCase {
  constructor(
    @Inject(ONCHURCH_NOTICE_REPOSITORY)
    private readonly noticeRepository: IOnchurchNoticeRepository,

    @Inject(ONCHURCH_CHURCH_REPOSITORY)
    private readonly churchRepository: IOnchurchChurchRepository,
  ) {}

  async execute(userId: number): Promise<OnchurchNotice[]> {
    const church = await this.churchRepository.findByOwnerId(userId);
    if (!church) return [];
    return this.noticeRepository.findAllByChurchId(church.id);
  }
}
