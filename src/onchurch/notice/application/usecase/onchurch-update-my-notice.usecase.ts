import { Inject, Injectable } from '@nestjs/common';
import { ONCHURCH_NOTICE_REPOSITORY, IOnchurchNoticeRepository } from '@/onchurch/notice/domain/repository/onchurch-notice.repository.interface';
import { ONCHURCH_CHURCH_REPOSITORY, IOnchurchChurchRepository } from '@/onchurch/church/domain/repository/onchurch-church.repository.interface';
import { OnchurchNotice } from '@/onchurch/notice/domain/entity/onchurch-notice.entity';
import { OnchurchNoticeWriteCommand } from '@/onchurch/notice/application/command/onchurch-notice-write.command';
import { OnchurchNoticeChurchNotConfigured, OnchurchNoticeNotFound } from '@/onchurch/notice/domain/exception/onchurch-notice.exception';

@Injectable()
export class OnchurchUpdateMyNoticeUseCase {
  constructor(
    @Inject(ONCHURCH_NOTICE_REPOSITORY)
    private readonly noticeRepository: IOnchurchNoticeRepository,

    @Inject(ONCHURCH_CHURCH_REPOSITORY)
    private readonly churchRepository: IOnchurchChurchRepository,
  ) {}

  async execute(userId: number, noticeId: number, command: OnchurchNoticeWriteCommand): Promise<OnchurchNotice> {
    const church = await this.churchRepository.findByOwnerId(userId);
    if (!church) throw new OnchurchNoticeChurchNotConfigured();
    const owned = await this.noticeRepository.findOwnedById(church.id, noticeId);
    if (!owned) throw new OnchurchNoticeNotFound();
    return this.noticeRepository.update(church.id, noticeId, command);
  }
}
