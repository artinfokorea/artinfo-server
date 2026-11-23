import { Inject, Injectable } from '@nestjs/common';
import { ONCHURCH_NOTICE_REPOSITORY, IOnchurchNoticeRepository } from '@/onchurch/notice/domain/repository/onchurch-notice.repository.interface';
import { OnchurchChurchManagerResolver } from '@/onchurch/church/application/service/onchurch-church-manager.resolver';
import { OnchurchNotice } from '@/onchurch/notice/domain/entity/onchurch-notice.entity';
import { OnchurchNoticeWriteCommand } from '@/onchurch/notice/application/command/onchurch-notice-write.command';
import { OnchurchNoticeChurchNotConfigured } from '@/onchurch/notice/domain/exception/onchurch-notice.exception';
import { OnchurchPushService } from '@/onchurch/push/onchurch-push.service';

@Injectable()
export class OnchurchCreateMyNoticeUseCase {
  constructor(
    @Inject(ONCHURCH_NOTICE_REPOSITORY)
    private readonly noticeRepository: IOnchurchNoticeRepository,

    private readonly managerResolver: OnchurchChurchManagerResolver,
    private readonly push: OnchurchPushService,
  ) {}

  async execute(userId: number, command: OnchurchNoticeWriteCommand): Promise<OnchurchNotice> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) throw new OnchurchNoticeChurchNotConfigured();
    const notice = await this.noticeRepository.create(church.id, command);
    // 교회 사람들에게 앱 알림 — 응답을 기다리게 하지 않는다 (발송 실패는 서비스가 삼킨다)
    void this.push.notifyChurchPost({
      churchId: church.id,
      authorId: userId,
      kind: 'notice',
      title: notice.title,
      isActive: notice.isActive,
      publishedAt: notice.publishedAt,
    });
    return notice;
  }
}
