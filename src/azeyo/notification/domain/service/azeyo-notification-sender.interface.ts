import { AZEYO_NOTIFICATION_TYPE } from '@/azeyo/notification/domain/entity/azeyo-notification.entity';

export const AZEYO_NOTIFICATION_SENDER = Symbol('AZEYO_NOTIFICATION_SENDER');

export interface NotificationPayload {
  userId: number;
  type: AZEYO_NOTIFICATION_TYPE;
  title: string;
  body: string;
  referenceId?: string;
}

/**
 * 알림 발송 채널 인터페이스
 * - 현재: IN_APP (DB 저장)
 * - 추후: KAKAO_ALIMTALK, PUSH 등 추가 가능
 */
export interface IAzeyoNotificationSender {
  send(payload: NotificationPayload): Promise<void>;
}
