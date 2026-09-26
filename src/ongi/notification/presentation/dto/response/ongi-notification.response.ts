import { ApiProperty } from '@nestjs/swagger';
import { OngiNotification } from '@/ongi/notification/domain/entity/ongi-notification.entity';
import { OngiNotificationListView } from '@/ongi/notification/application/usecase/ongi-notification.usecase';

export class OngiNotificationResponse {
  @ApiProperty({ type: String, description: '알림 id' }) id: string;
  @ApiProperty({
    type: String,
    description: '종류 — photo · comment · like · event_created · event_updated · event_reminder · member_joined · inquiry_answered · system',
  })
  type: string;
  @ApiProperty({ type: String, description: '제목' }) title: string;
  @ApiProperty({ type: String, description: '본문 (푸시와 동일)' }) body: string;
  @ApiProperty({ type: Object, description: '탭 시 이동 정보 — 푸시 data 와 동일 (groupId, photoId, eventId, inquiryId …)' }) data: Record<string, string>;
  @ApiProperty({ type: String, description: '생성 시각 (ISO)' }) createdAt: string;

  constructor(notification: OngiNotification) {
    this.id = String(notification.id);
    this.type = notification.type;
    this.title = notification.title;
    this.body = notification.body;
    this.data = notification.data ?? {};
    this.createdAt = new Date(notification.createdAt).toISOString();
  }
}

export class OngiNotificationListResponse {
  @ApiProperty({ type: [OngiNotificationResponse], description: '최근 30일 알림 (최근 순, 최대 100개)' }) notifications: OngiNotificationResponse[];
  @ApiProperty({ type: String, required: false, description: '마지막으로 목록을 연 시각 (ISO) — 이보다 뒤 항목이 새로운 알림. 한 번도 안 열었으면 없음' })
  seenAt?: string;

  constructor(view: OngiNotificationListView) {
    this.notifications = view.notifications.map(notification => new OngiNotificationResponse(notification));
    this.seenAt = view.seenAt ? new Date(view.seenAt).toISOString() : undefined;
  }
}

export class OngiUnseenNotificationCountResponse {
  @ApiProperty({ type: Number, description: '마지막으로 연 뒤 생긴 알림 개수 (종 아이콘 배지)' }) count: number;

  constructor(count: number) {
    this.count = count;
  }
}

export class OngiNotificationsSeenResponse {
  @ApiProperty({ type: String, description: '본 것으로 처리한 시각 (ISO)' }) seenAt: string;

  constructor(seenAt: Date) {
    this.seenAt = seenAt.toISOString();
  }
}
