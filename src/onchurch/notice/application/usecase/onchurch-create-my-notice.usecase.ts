import { Inject, Injectable } from '@nestjs/common';
import { ONCHURCH_NOTICE_REPOSITORY, IOnchurchNoticeRepository } from '@/onchurch/notice/domain/repository/onchurch-notice.repository.interface';
import { OnchurchChurchManagerResolver } from '@/onchurch/church/application/service/onchurch-church-manager.resolver';
import { OnchurchNotice } from '@/onchurch/notice/domain/entity/onchurch-notice.entity';
import { OnchurchNoticeWriteCommand } from '@/onchurch/notice/application/command/onchurch-notice-write.command';
import { OnchurchNoticeChurchNotConfigured } from '@/onchurch/notice/domain/exception/onchurch-notice.exception';

@Injectable()
export class OnchurchCreateMyNoticeUseCase {
  constructor(
    @Inject(ONCHURCH_NOTICE_REPOSITORY)
    private readonly noticeRepository: IOnchurchNoticeRepository,

    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}

  async execute(userId: number, command: OnchurchNoticeWriteCommand): Promise<OnchurchNotice> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) throw new OnchurchNoticeChurchNotConfigured();
    return this.noticeRepository.create(church.id, command);
  }
}
