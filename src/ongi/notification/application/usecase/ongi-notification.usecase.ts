import { Inject, Injectable } from '@nestjs/common';
import { IOngiNotificationRepository, ONGI_NOTIFICATION_REPOSITORY } from '@/ongi/notification/domain/repository/ongi-notification.repository.interface';
import { OngiNotification } from '@/ongi/notification/domain/entity/ongi-notification.entity';
import { notificationRetentionCutoff } from '@/ongi/notification/domain/service/ongi-notification';

const LIST_LIMIT = 100;

export interface OngiNotificationListView {
  notifications: OngiNotification[];
  /** 마지막으로 목록을 연 시각 — 이보다 뒤 항목이 "새로운 알림". 한 번도 안 열었으면 null */
  seenAt: Date | null;
}

@Injectable()
export class OngiScanMyNotificationsUseCase {
  constructor(
    @Inject(ONGI_NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: IOngiNotificationRepository,
  ) {}

  /** 최근 30일, 최근 순, 최대 100개. 읽음 처리는 하지 않는다 — 앱이 목록을 연 뒤 별도로 seen 을 호출 */
  async execute(userId: number): Promise<OngiNotificationListView> {
    const [notifications, seenAt] = await Promise.all([
      this.notificationRepository.scanByUserId(userId, notificationRetentionCutoff(new Date()), LIST_LIMIT),
      this.notificationRepository.findSeenAt(userId),
    ]);
    return { notifications, seenAt };
  }
}

@Injectable()
export class OngiCountUnseenNotificationsUseCase {
  constructor(
    @Inject(ONGI_NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: IOngiNotificationRepository,
  ) {}

  /** 종 아이콘 배지 숫자 — 마지막으로 연 뒤 생긴 알림 개수 */
  async execute(userId: number): Promise<number> {
    const seenAt = await this.notificationRepository.findSeenAt(userId);
    return this.notificationRepository.countUnseen(userId, notificationRetentionCutoff(new Date()), seenAt);
  }
}

@Injectable()
export class OngiMarkNotificationsSeenUseCase {
  constructor(
    @Inject(ONGI_NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: IOngiNotificationRepository,
  ) {}

  /** 목록을 열었다 — 지금까지의 알림을 전부 본 것으로 (인스타그램 방식) */
  async execute(userId: number): Promise<Date> {
    const now = new Date();
    await this.notificationRepository.markSeen(userId, now);
    return now;
  }
}
