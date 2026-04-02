import { ApiProperty } from '@nestjs/swagger';
import { AzeyoNotification, AZEYO_NOTIFICATION_TYPE } from '@/azeyo/notification/domain/entity/azeyo-notification.entity';

export class AzeyoNotificationResponse {
  @ApiProperty() id: number;
  @ApiProperty() type: AZEYO_NOTIFICATION_TYPE;
  @ApiProperty() title: string;
  @ApiProperty() body: string;
  @ApiProperty() referenceId: string | null;
  @ApiProperty() isRead: boolean;
  @ApiProperty() createdAt: Date;

  constructor(n: AzeyoNotification) {
    this.id = n.id;
    this.type = n.type;
    this.title = n.title;
    this.body = n.body;
    this.referenceId = n.referenceId;
    this.isRead = n.isRead;
    this.createdAt = n.createdAt;
  }
}

export class AzeyoNotificationsResponse {
  @ApiProperty({ type: [AzeyoNotificationResponse] }) notifications: AzeyoNotificationResponse[];
  @ApiProperty() totalCount: number;
  @ApiProperty() unreadCount: number;

  constructor(items: AzeyoNotification[], totalCount: number, unreadCount: number) {
    this.notifications = items.map(n => new AzeyoNotificationResponse(n));
    this.totalCount = totalCount;
    this.unreadCount = unreadCount;
  }
}
