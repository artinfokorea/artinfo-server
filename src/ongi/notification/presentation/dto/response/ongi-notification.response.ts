import { ApiProperty } from '@nestjs/swagger';
import { OngiNotification } from '@/ongi/notification/domain/entity/ongi-notification.entity';

export class OngiNotificationResponse {
  @ApiProperty({ type: String, description: '알림 id' })
  id: string;

  @ApiProperty({ type: String, description: '그룹 id' })
  groupId: string;

  @ApiProperty({ type: String, description: '종류 (PHOTO_UPLOADED | PHOTO_LIKED | COMMENT_ADDED)' })
  type: string;

  @ApiProperty({ type: String, description: '표시 문구' })
  message: string;

  @ApiProperty({ type: String, nullable: true, description: '관련 사진 id' })
  photoId: string | null;

  @ApiProperty({ type: String, nullable: true, description: '관련 사진 썸네일 URL' })
  photoUrl: string | null;

  @ApiProperty({ type: Boolean, description: '읽음 여부' })
  read: boolean;

  @ApiProperty({ type: String, description: '생성 시각 (ISO)' })
  createdAt: string;

  constructor(notification: OngiNotification) {
    this.id = String(notification.id);
    this.groupId = String(notification.groupId);
    this.type = notification.type;
    this.message = notification.message;
    this.photoId = notification.photoId != null ? String(notification.photoId) : null;
    this.photoUrl = notification.photoUrl;
    this.read = notification.readAt != null;
    this.createdAt = notification.createdAt.toISOString();
  }
}

export class OngiNotificationListResponse {
  @ApiProperty({ type: [OngiNotificationResponse], description: '알림 목록 (최신순)' })
  notifications: OngiNotificationResponse[];

  constructor(notifications: OngiNotification[]) {
    this.notifications = notifications.map(notification => new OngiNotificationResponse(notification));
  }
}
