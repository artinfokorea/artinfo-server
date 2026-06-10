import { Inject, Injectable } from '@nestjs/common';
import { ONCHURCH_NOTICE_REPOSITORY, IOnchurchNoticeRepository } from '@/onchurch/notice/domain/repository/onchurch-notice.repository.interface';
import { OnchurchChurchManagerResolver } from '@/onchurch/church/application/service/onchurch-church-manager.resolver';
import { OnchurchNotice } from '@/onchurch/notice/domain/entity/onchurch-notice.entity';

@Injectable()
export class OnchurchListMyNoticesUseCase {
  constructor(
    @Inject(ONCHURCH_NOTICE_REPOSITORY)
    private readonly noticeRepository: IOnchurchNoticeRepository,

    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}

  async execute(userId: number): Promise<OnchurchNotice[]> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) return [];
    return this.noticeRepository.findAllByChurchId(church.id);
  }
}
