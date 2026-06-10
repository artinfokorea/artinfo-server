import { Inject, Injectable } from '@nestjs/common';
import { ONCHURCH_NOTICE_REPOSITORY, IOnchurchNoticeRepository } from '@/onchurch/notice/domain/repository/onchurch-notice.repository.interface';
import { OnchurchChurchManagerResolver } from '@/onchurch/church/application/service/onchurch-church-manager.resolver';
import { OnchurchNoticeChurchNotConfigured, OnchurchNoticeNotFound } from '@/onchurch/notice/domain/exception/onchurch-notice.exception';

@Injectable()
export class OnchurchDeleteMyNoticeUseCase {
  constructor(
    @Inject(ONCHURCH_NOTICE_REPOSITORY)
    private readonly noticeRepository: IOnchurchNoticeRepository,

    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}

  async execute(userId: number, noticeId: number): Promise<void> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) throw new OnchurchNoticeChurchNotConfigured();
    const owned = await this.noticeRepository.findOwnedById(church.id, noticeId);
    if (!owned) throw new OnchurchNoticeNotFound();
    await this.noticeRepository.remove(church.id, noticeId);
  }
}
